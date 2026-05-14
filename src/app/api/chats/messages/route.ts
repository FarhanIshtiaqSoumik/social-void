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
    const chatId = searchParams.get('chatId')
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 })
    }

    // Verify membership
    const member = await db.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: authUser.userId } },
    })
    if (!member) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: {
        chatId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      include: {
        sender: { select: { id: true, username: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Filter out voided messages
    const filteredMessages = messages.filter(m => !m.isVoided)

    let nextCursor: string | null = null
    if (filteredMessages.length === limit) {
      nextCursor = filteredMessages[filteredMessages.length - 1].id
    }

    return NextResponse.json({ messages: filteredMessages.reverse(), nextCursor })
  } catch (error) {
    console.error('Messages GET error:', error)
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
    const { chatId, content, mediaUrl, mediaType } = body

    if (!chatId || !content) {
      return NextResponse.json({ error: 'chatId and content required' }, { status: 400 })
    }

    const member = await db.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: authUser.userId } },
    })
    if (!member) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    const message = await db.message.create({
      data: {
        content,
        chatId,
        senderId: authUser.userId,
        mediaUrl,
        mediaType,
      },
      include: {
        sender: { select: { id: true, username: true, name: true, avatar: true } },
      },
    })

    // Update chat's updatedAt
    await db.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } })

    // If void mode, schedule message deletion
    const chat = await db.chat.findUnique({ where: { id: chatId } })
    if (chat?.voidMode) {
      // Mark for void after 24 hours
      const voidAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await db.message.update({
        where: { id: message.id },
        data: { voidAt, isVoided: false },
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Messages POST error:', error)
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
    const { messageId, content } = body

    if (!messageId || !content) {
      return NextResponse.json({ error: 'messageId and content required' }, { status: 400 })
    }

    // Verify the user owns the message
    const existingMessage = await db.message.findUnique({
      where: { id: messageId },
    })
    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existingMessage.senderId !== authUser.userId) {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
    }
    if (existingMessage.isVoided) {
      return NextResponse.json({ error: 'Cannot edit a voided message' }, { status: 400 })
    }

    const message = await db.message.update({
      where: { id: messageId },
      data: { content, isEdited: true },
      include: {
        sender: { select: { id: true, username: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Messages PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 })
    }

    // Verify the user owns the message
    const existingMessage = await db.message.findUnique({
      where: { id: messageId },
    })
    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existingMessage.senderId !== authUser.userId) {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 })
    }
    if (existingMessage.isVoided) {
      return NextResponse.json({ error: 'Message already voided' }, { status: 400 })
    }

    // Soft delete: set content to [void] and isVoided to true
    const message = await db.message.update({
      where: { id: messageId },
      data: { content: '[void]', isVoided: true },
      include: {
        sender: { select: { id: true, username: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Messages DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
