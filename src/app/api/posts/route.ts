import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'feed'
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId')
    const tag = searchParams.get('tag')

    let where: any = {}

    if (type === 'user' && userId) {
      where.authorId = userId
    } else if (type === 'discover') {
      // Discovery: show posts from users the current user doesn't follow
      if (authUser) {
        const following = await db.follow.findMany({
          where: { followerId: authUser.userId },
          select: { followingId: true },
        })
        const followingIds = following.map(f => f.followingId)
        where.authorId = { notIn: [...followingIds, authUser.userId] }
      }
    } else if (type === 'tag' && tag) {
      where.tags = { contains: tag }
    } else if (type === 'search') {
      const q = searchParams.get('q') || ''
      where.OR = [
        { caption: { contains: q } },
        { tags: { contains: q } },
        { author: { username: { contains: q } } },
        { author: { name: { contains: q } } },
      ]
    }

    const posts = await db.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: authUser ? {
          where: { userId: authUser.userId },
          select: { id: true },
        } : false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    let nextCursor: string | null = null
    if (posts.length > limit) {
      nextCursor = posts[limit].id
      posts.pop()
    }

    const postsWithLiked = posts.map(post => ({
      ...post,
      isLiked: authUser ? post.likes?.length > 0 : false,
      likes: undefined,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      tags: post.tags ? JSON.parse(post.tags) : [],
    }))

    return NextResponse.json({ posts: postsWithLiked, nextCursor })
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caption, mediaUrls, mediaType, tags } = body

    const post = await db.post.create({
      data: {
        caption: caption || '',
        mediaUrls: JSON.stringify(mediaUrls || []),
        mediaType: mediaType || 'image',
        tags: JSON.stringify(tags || []),
        authorId: authUser.userId,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json({
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls || '[]'),
      tags: JSON.parse(post.tags || '[]'),
      isLiked: false,
    })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== authUser.userId && !authUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db.post.delete({ where: { id: postId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Posts DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
