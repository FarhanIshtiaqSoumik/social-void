import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
            _count: { select: { likes: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, replies: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Comments GET error:', error)
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
    const { content, postId, parentId } = body

    if (!content || !postId) {
      return NextResponse.json({ error: 'Content and postId required' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        content,
        postId,
        authorId: authUser.userId,
        parentId: parentId || undefined,
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatar: true, isVerified: true } },
        _count: { select: { likes: true, replies: true } },
      },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
