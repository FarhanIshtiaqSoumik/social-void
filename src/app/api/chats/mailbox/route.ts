import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const authUser = verifyToken(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's DM chats
    const chatMembers = await db.chatMember.findMany({
      where: { userId: authUser.userId },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              where: { senderId: { not: authUser.userId } },
              include: {
                sender: { select: { id: true, username: true, name: true } },
              },
            },
          },
        },
      },
    })

    // Filter to only DM chats (not group)
    const dmChats = chatMembers.filter((cm) => !cm.chat.isGroup)

    // Get friend IDs (mutual follows)
    const iFollow = await db.follow.findMany({
      where: { followerId: authUser.userId },
      select: { followingId: true },
    })
    const iFollowIds = iFollow.map((f) => f.followingId)

    const friendsWhoFollowMe = await db.follow.findMany({
      where: {
        followerId: { in: iFollowIds },
        followingId: authUser.userId,
      },
      select: { followerId: true },
    })
    const mutualFriendIds = new Set(friendsWhoFollowMe.map((f) => f.followerId))

    // Build mailbox entries: DMs where the other user is NOT a mutual friend
    const mailbox = []

    for (const cm of dmChats) {
      const otherMember = cm.chat.members.find((m) => m.userId !== authUser.userId)
      if (!otherMember) continue

      // Skip if the other user is a mutual friend
      if (mutualFriendIds.has(otherMember.userId)) continue

      // Count unread messages from the non-friend
      const unreadCount = await db.message.count({
        where: {
          chatId: cm.chatId,
          senderId: otherMember.userId,
          isRead: false,
          isVoided: false,
        },
      })

      // Only include if there are messages from the non-friend
      const totalMessages = await db.message.count({
        where: {
          chatId: cm.chatId,
          senderId: otherMember.userId,
          isVoided: false,
        },
      })

      if (totalMessages === 0) continue

      const lastMessage = cm.chat.messages[0] || null

      mailbox.push({
        chatId: cm.chatId,
        user: {
          id: otherMember.user.id,
          username: otherMember.user.username,
          name: otherMember.user.name,
          avatar: otherMember.user.avatar,
          isVerified: otherMember.user.isVerified,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
      })
    }

    // Sort by most recent message
    mailbox.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
      return bTime - aTime
    })

    return NextResponse.json({ mailbox })
  } catch (error) {
    console.error('Mailbox GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const authUser = verifyToken(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { chatId, action } = body

    if (!chatId || !action) {
      return NextResponse.json({ error: 'chatId and action are required' }, { status: 400 })
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "accept" or "reject"' }, { status: 400 })
    }

    // Verify the user is a member of this chat
    const member = await db.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: authUser.userId } },
    })
    if (!member) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    // Get the chat to find the other user
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, name: true, avatar: true } },
          },
        },
      },
    })

    if (!chat || chat.isGroup) {
      return NextResponse.json({ error: 'Invalid chat for mailbox action' }, { status: 400 })
    }

    const otherMember = chat.members.find((m) => m.userId !== authUser.userId)
    if (!otherMember) {
      return NextResponse.json({ error: 'Other user not found in chat' }, { status: 404 })
    }

    if (action === 'accept') {
      // Follow the user to make them a friend (if we already follow them, this is a no-op)
      const existingFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: authUser.userId,
            followingId: otherMember.userId,
          },
        },
      })

      if (!existingFollow) {
        await db.follow.create({
          data: {
            followerId: authUser.userId,
            followingId: otherMember.userId,
          },
        })
      }

      // Also check if the other user follows us - if not, create that too for mutual friendship
      const reverseFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: otherMember.userId,
            followingId: authUser.userId,
          },
        },
      })

      if (!reverseFollow) {
        await db.follow.create({
          data: {
            followerId: otherMember.userId,
            followingId: authUser.userId,
          },
        })
      }

      // Mark unread messages as read
      await db.message.updateMany({
        where: {
          chatId,
          senderId: otherMember.userId,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true, action: 'accept' })
    }

    if (action === 'reject') {
      // Remove the current user from the chat
      await db.chatMember.delete({
        where: { chatId_userId: { chatId, userId: authUser.userId } },
      })

      // If no members left, delete the chat
      const remainingMembers = await db.chatMember.count({
        where: { chatId },
      })
      if (remainingMembers === 0) {
        await db.chat.delete({ where: { id: chatId } })
      }

      return NextResponse.json({ success: true, action: 'reject' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Mailbox POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
