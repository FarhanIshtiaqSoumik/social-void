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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received'

    const userSelect = {
      id: true,
      username: true,
      name: true,
      avatar: true,
      isVerified: true,
    }

    // GET /api/friends?type=check&userId=xxx - Check friendship status
    if (type === 'check') {
      const checkUserId = searchParams.get('userId')
      if (!checkUserId) {
        return NextResponse.json({ error: 'userId is required for check' }, { status: 400 })
      }

      if (checkUserId === authUser.userId) {
        return NextResponse.json({ isFriend: false, isFollowing: false, isFollower: false })
      }

      const isFollowing = !!(await db.follow.findFirst({
        where: { followerId: authUser.userId, followingId: checkUserId },
      }))

      const isFollower = !!(await db.follow.findFirst({
        where: { followerId: checkUserId, followingId: authUser.userId },
      }))

      const isFriend = isFollowing && isFollower

      return NextResponse.json({ isFriend, isFollowing, isFollower })
    }

    // GET /api/friends?type=list - Get user's friends (mutual follows) + pending count
    if (type === 'list') {
      // Users I follow
      const iFollow = await db.follow.findMany({
        where: { followerId: authUser.userId },
        select: { followingId: true },
      })
      const iFollowIds = iFollow.map((f) => f.followingId)

      // Mutual follows: users I follow who also follow me back
      const friendsWhoFollowMe = await db.follow.findMany({
        where: {
          followerId: { in: iFollowIds },
          followingId: authUser.userId,
        },
        select: { followerId: true },
      })
      const mutualIds = friendsWhoFollowMe.map((f) => f.followerId)

      const friends = await db.user.findMany({
        where: { id: { in: mutualIds } },
        select: userSelect,
      })

      // Pending friend requests count
      const pendingSent = await db.friendRequest.count({
        where: { senderId: authUser.userId, status: 'pending' },
      })
      const pendingReceived = await db.friendRequest.count({
        where: { receiverId: authUser.userId, status: 'pending' },
      })

      return NextResponse.json({
        friends,
        pendingRequests: pendingSent + pendingReceived,
        pendingSent,
        pendingReceived,
      })
    }

    let requests

    if (type === 'sent') {
      requests = await db.friendRequest.findMany({
        where: {
          senderId: authUser.userId,
          status: 'pending',
        },
        include: {
          receiver: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'received') {
      requests = await db.friendRequest.findMany({
        where: {
          receiverId: authUser.userId,
          status: 'pending',
        },
        include: {
          sender: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'friends') {
      requests = await db.friendRequest.findMany({
        where: {
          OR: [
            { senderId: authUser.userId, status: 'accepted' },
            { receiverId: authUser.userId, status: 'accepted' },
          ],
        },
        include: {
          sender: { select: userSelect },
          receiver: { select: userSelect },
        },
        orderBy: { updatedAt: 'desc' },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "sent", "received", "friends", "list", or "check"' },
        { status: 400 }
      )
    }

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Friends GET error:', error)
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (userId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Verify the target user exists
    const targetUser = await db.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if a friend request already exists (in either direction)
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: authUser.userId, receiverId: userId },
          { senderId: userId, receiverId: authUser.userId },
        ],
      },
    })

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'A pending friend request already exists between you two' },
          { status: 409 }
        )
      } else if (existingRequest.status === 'accepted') {
        return NextResponse.json(
          { error: 'You are already friends' },
          { status: 409 }
        )
      }
      // If rejected, allow re-sending by deleting the old request
      await db.friendRequest.delete({ where: { id: existingRequest.id } })
    }

    // Create the friend request
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: authUser.userId,
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
        receiver: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
      },
    })

    // Create a notification for the receiver
    await db.notification.create({
      data: {
        userId,
        fromUserId: authUser.userId,
        type: 'friend_request',
        title: 'New Friend Request',
        content: `sent you a friend request`,
        relatedId: friendRequest.id,
        relatedType: 'user',
      },
    })

    return NextResponse.json({ request: friendRequest }, { status: 201 })
  } catch (error) {
    console.error('Friends POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { requestId, action } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'requestId and action are required' },
        { status: 400 }
      )
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    // Find the friend request
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // Only the receiver can accept/reject
    if (friendRequest.receiverId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Only the receiver can accept or reject a friend request' },
        { status: 403 }
      )
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Friend request is already ${friendRequest.status}` },
        { status: 400 }
      )
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    const updatedRequest = await db.friendRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
        receiver: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
      },
    })

    // If accepted, create a DM chat between the two users (if one doesn't exist)
    if (action === 'accept') {
      const existingChat = await db.chat.findFirst({
        where: {
          isGroup: false,
          members: {
            every: {
              userId: { in: [friendRequest.senderId, friendRequest.receiverId] },
            },
          },
        },
      })

      const chatMemberCount = existingChat
        ? await db.chatMember.count({
            where: { chatId: existingChat.id },
          })
        : 0

      if (!existingChat || chatMemberCount !== 2) {
        await db.chat.create({
          data: {
            isGroup: false,
            members: {
              create: [
                { userId: friendRequest.senderId, role: 'member' },
                { userId: friendRequest.receiverId, role: 'member' },
              ],
            },
          },
        })
      }

      // Create a notification for the sender
      await db.notification.create({
        data: {
          userId: friendRequest.senderId,
          fromUserId: authUser.userId,
          type: 'friend_request',
          title: 'Friend Request Accepted',
          content: 'accepted your friend request',
          relatedId: friendRequest.id,
          relatedType: 'user',
        },
      })
    }

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error('Friends PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
