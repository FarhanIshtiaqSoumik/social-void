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
              include: {
                sender: { select: { id: true, username: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { chat: { updatedAt: 'desc' } },
    })

    const chats = chatMembers.map(cm => ({
      id: cm.chat.id,
      name: cm.chat.name,
      isGroup: cm.chat.isGroup,
      avatar: cm.chat.avatar,
      voidMode: cm.chat.voidMode,
      members: cm.chat.members,
      lastMessage: cm.chat.messages[0] || null,
      role: cm.role,
    }))

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Chats GET error:', error)
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
    const { userIds, name, isGroup, voidMode } = body

    if (!userIds || userIds.length === 0) {
      return NextResponse.json({ error: 'At least one user required' }, { status: 400 })
    }

    // For direct messages, check if chat already exists
    if (!isGroup && userIds.length === 1) {
      const existingChat = await db.chat.findFirst({
        where: {
          isGroup: false,
          members: {
            every: {
              userId: { in: [authUser.userId, userIds[0]] },
            },
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
            },
          },
        },
      })

      if (existingChat && existingChat.members.length === 2) {
        return NextResponse.json({ chat: existingChat, existed: true })
      }
    }

    const chat = await db.chat.create({
      data: {
        name: isGroup ? name : null,
        isGroup: isGroup || false,
        voidMode: voidMode || false,
        members: {
          create: [
            { userId: authUser.userId, role: 'admin' },
            ...userIds.map((uid: string) => ({ userId: uid, role: 'member' })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
          },
        },
      },
    })

    return NextResponse.json({ chat, existed: false })
  } catch (error) {
    console.error('Chats POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
