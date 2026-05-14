import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
    const { postId, commentId } = body

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'postId or commentId required' }, { status: 400 })
    }

    const existing = await db.like.findFirst({
      where: {
        userId: authUser.userId,
        ...(postId ? { postId } : { commentId }),
      },
    })

    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      await db.like.create({
        data: {
          userId: authUser.userId,
          ...(postId ? { postId } : { commentId }),
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
