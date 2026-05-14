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
    const userId = searchParams.get('id')
    const username = searchParams.get('username')
    const type = searchParams.get('type')

    if (type === 'search') {
      const query = searchParams.get('q') || ''
      const users = await db.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { name: { contains: query } },
          ],
        },
        select: {
          id: true, username: true, name: true, avatar: true, isVerified: true, bio: true,
        },
        take: 10,
      })
      return NextResponse.json({ users })
    }

    const where = userId ? { id: userId } : username ? { username } : { id: authUser.userId }
    const user = await db.user.findUnique({
      where,
      select: {
        id: true, username: true, name: true, email: true, avatar: true, bio: true,
        website: true, isPrivate: true, isVerified: true, isAdmin: true, createdAt: true,
        _count: { select: { posts: true, followers: true, following: true } },
        followers: {
          where: { followerId: authUser.userId },
          select: { id: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Note: Prisma relation naming is inverted:
    // user.followers = Follow records where this user is the follower = people this user follows
    // user.following = Follow records where this user is being followed = people who follow this user
    // We swap the counts here so the frontend gets semantically correct values
    return NextResponse.json({
      ...user,
      isFollowing: user.followers.length > 0,
      _count: {
        posts: user._count.posts,
        followers: user._count.following, // following relation = who follows this user
        following: user._count.followers, // followers relation = who this user follows
      },
      followers: undefined,
    })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
