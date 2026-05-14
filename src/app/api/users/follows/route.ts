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
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'followers' or 'following' or 'suggestions'

    if (type === 'suggestions') {
      // People You May Know: users that my followings follow, but I don't
      const myFollowing = await db.follow.findMany({
        where: { followerId: authUser.userId },
        select: { followingId: true },
      })
      const myFollowingIds = myFollowing.map(f => f.followingId)

      // Get users that my followings follow (2nd degree connections)
      const secondDegree = await db.follow.findMany({
        where: {
          followerId: { in: myFollowingIds },
          followingId: { notIn: [...myFollowingIds, authUser.userId] },
        },
        include: {
          following: {
            select: { id: true, username: true, name: true, avatar: true, isVerified: true, bio: true },
          },
          follower: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      })

      // Group by user and count mutual connections
      const userMap = new Map<string, {
        user: { id: string; username: string; name: string | null; avatar: string | null; isVerified: boolean; bio: string | null }
        mutualCount: number
        mutualFriends: { id: string; username: string; name: string | null; avatar: string | null }[]
      }>()

      for (const conn of secondDegree) {
        const existing = userMap.get(conn.following.id)
        if (existing) {
          existing.mutualCount++
          if (existing.mutualFriends.length < 3) {
            existing.mutualFriends.push(conn.follower)
          }
        } else {
          userMap.set(conn.following.id, {
            user: conn.following,
            mutualCount: 1,
            mutualFriends: [conn.follower],
          })
        }
      }

      // Sort by mutual count, take top 20
      const suggestions = Array.from(userMap.values())
        .sort((a, b) => b.mutualCount - a.mutualCount)
        .slice(0, 20)
        .map(s => ({
          ...s.user,
          mutualCount: s.mutualCount,
          mutualFriends: s.mutualFriends,
          isFollowing: false,
          isSelf: false,
        }))

      // If not enough suggestions, add random users
      if (suggestions.length < 10) {
        const suggestedIds = new Set(suggestions.map(s => s.id))
        suggestedIds.add(authUser.userId)
        myFollowingIds.forEach(id => suggestedIds.add(id))

        const randomUsers = await db.user.findMany({
          where: { id: { notIn: Array.from(suggestedIds) } },
          select: { id: true, username: true, name: true, avatar: true, isVerified: true, bio: true },
          take: 10 - suggestions.length,
        })

        const randomSuggestions = randomUsers.map(u => ({
          ...u,
          mutualCount: 0,
          mutualFriends: [],
          isFollowing: false,
          isSelf: false,
        }))

        suggestions.push(...randomSuggestions)
      }

      return NextResponse.json({ users: suggestions })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    if (type === 'followers') {
      const follows = await db.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: { id: true, username: true, name: true, avatar: true, isVerified: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const followerIds = follows.map(f => f.follower.id)
      const myFollowing = await db.follow.findMany({
        where: { followerId: authUser.userId, followingId: { in: followerIds } },
        select: { followingId: true },
      })
      const myFollowingSet = new Set(myFollowing.map(f => f.followingId))

      const users = follows.map(f => ({
        ...f.follower,
        isFollowing: myFollowingSet.has(f.follower.id),
        isSelf: f.follower.id === authUser.userId,
      }))

      return NextResponse.json({ users })
    }

    if (type === 'following') {
      const follows = await db.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: { id: true, username: true, name: true, avatar: true, isVerified: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const followingIds = follows.map(f => f.following.id)
      const myFollowing = await db.follow.findMany({
        where: { followerId: authUser.userId, followingId: { in: followingIds } },
        select: { followingId: true },
      })
      const myFollowingSet = new Set(myFollowing.map(f => f.followingId))

      const users = follows.map(f => ({
        ...f.following,
        isFollowing: myFollowingSet.has(f.following.id),
        isSelf: f.following.id === authUser.userId,
      }))

      return NextResponse.json({ users })
    }

    return NextResponse.json({ error: 'Invalid type. Use followers, following, or suggestions' }, { status: 400 })
  } catch (error) {
    console.error('Follows API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
