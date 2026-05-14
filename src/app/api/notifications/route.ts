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

    // Fetch unread notifications for the authenticated user
    const notifications = await db.notification.findMany({
      where: {
        userId: authUser.userId,
        isRead: false,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // For "ping" type notifications, only include if user is a member of the related chat
    const filteredNotifications = []
    for (const notification of notifications) {
      if (notification.type === 'ping' && notification.relatedId) {
        const membership = await db.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId: notification.relatedId,
              userId: authUser.userId,
            },
          },
        })
        if (!membership) continue
      }
      filteredNotifications.push(notification)
    }

    return NextResponse.json({ notifications: filteredNotifications })
  } catch (error) {
    console.error('Notifications GET error:', error)
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
    const { userId, type, title, content, relatedId, relatedType } = body

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'userId, type, and title are required' },
        { status: 400 }
      )
    }

    const validTypes = ['mention', 'like', 'comment', 'follow', 'friend_request', 'ping']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify the recipient user exists
    const recipient = await db.user.findUnique({ where: { id: userId } })
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 })
    }

    const notification = await db.notification.create({
      data: {
        userId,
        fromUserId: authUser.userId,
        type,
        title,
        content: content || null,
        relatedId: relatedId || null,
        relatedType: relatedType || null,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Notifications POST error:', error)
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
    const { notificationIds, markAll } = body

    let deletedCount = 0

    if (markAll) {
      // Mark all unread notifications as read (then delete them)
      const result = await db.notification.deleteMany({
        where: {
          userId: authUser.userId,
          isRead: false,
        },
      })
      deletedCount = result.count
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read (then delete them)
      const result = await db.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: authUser.userId,
          isRead: false,
        },
      })
      deletedCount = result.count
    } else {
      return NextResponse.json(
        { error: 'Provide notificationIds array or markAll: true' },
        { status: 400 }
      )
    }

    return NextResponse.json({ deletedCount })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
