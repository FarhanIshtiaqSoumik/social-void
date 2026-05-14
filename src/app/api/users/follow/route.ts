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
    const { userId } = body
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    if (userId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: authUser.userId, followingId: userId } },
    })

    if (existing) {
      await db.follow.delete({ where: { id: existing.id } })
      return NextResponse.json({ following: false })
    } else {
      await db.follow.create({
        data: { followerId: authUser.userId, followingId: userId },
      })
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
