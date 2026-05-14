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
    const { name, bio, website, avatar, isPrivate } = body

    const user = await db.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(avatar !== undefined && { avatar }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      select: {
        id: true, username: true, name: true, email: true, avatar: true, bio: true,
        website: true, isPrivate: true, isVerified: true, isAdmin: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
