import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Helper to authenticate requests
function getAuthUser(request: NextRequest): { userId: string; email: string } | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  return verifyToken(token)
}

// GET /api/stories - Get active stories from user's friends (mutual follows)
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Get user's friends (mutual follows)
    // Users I follow
    const iFollow = await db.follow.findMany({
      where: { followerId: authUser.userId },
      select: { followingId: true },
    })
    const iFollowIds = iFollow.map((f) => f.followingId)

    // Users who follow me
    const followMe = await db.follow.findMany({
      where: { followingId: authUser.userId },
      select: { followerId: true },
    })
    const followMeIds = followMe.map((f) => f.followerId)

    // Mutual follow = friends (intersection)
    const friendIds = iFollowIds.filter((id) => followMeIds.includes(id))

    // Also include own stories
    const storyAuthorIds = [...friendIds, authUser.userId]

    // Fetch active stories from friends (and self)
    const stories = await db.story.findMany({
      where: {
        authorId: { in: storyAuthorIds },
        expiresAt: { gt: now },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Build authors summary grouped by author
    const authorMap = new Map<
      string,
      {
        userId: string
        username: string
        name: string | null
        avatar: string | null
        hasActiveStory: boolean
        storyCount: number
        latestStoryCreatedAt: Date
      }
    >()

    for (const story of stories) {
      const existing = authorMap.get(story.authorId)
      if (existing) {
        existing.storyCount++
        if (story.createdAt > existing.latestStoryCreatedAt) {
          existing.latestStoryCreatedAt = story.createdAt
        }
      } else {
        authorMap.set(story.authorId, {
          userId: story.author.id,
          username: story.author.username,
          name: story.author.name,
          avatar: story.author.avatar,
          hasActiveStory: true,
          storyCount: 1,
          latestStoryCreatedAt: story.createdAt,
        })
      }
    }

    // Sort authors by latest story creation time (most recent first)
    const authors = Array.from(authorMap.values()).sort(
      (a, b) => new Date(b.latestStoryCreatedAt).getTime() - new Date(a.latestStoryCreatedAt).getTime()
    )

    // Serialize stories (convert dates to strings)
    const serializedStories = stories.map((story) => ({
      id: story.id,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      caption: story.caption,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
      author: {
        id: story.author.id,
        username: story.author.username,
        name: story.author.name,
        avatar: story.author.avatar,
      },
    }))

    const serializedAuthors = authors.map((author) => ({
      ...author,
      latestStoryCreatedAt: author.latestStoryCreatedAt.toISOString(),
    }))

    return NextResponse.json({
      stories: serializedStories,
      authors: serializedAuthors,
    })
  } catch (error) {
    console.error('Stories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mediaUrl, mediaType, caption, duration } = body

    if (!mediaUrl) {
      return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 })
    }

    // Validate mediaType
    const validMediaType = mediaType === 'video' ? 'video' : 'image'

    // Validate duration (1-48 hours)
    const validDuration = typeof duration === 'number' && duration >= 1 && duration <= 48 ? duration : 24

    // Check max 5 active stories per user
    const now = new Date()
    const activeStoryCount = await db.story.count({
      where: {
        authorId: authUser.userId,
        expiresAt: { gt: now },
      },
    })

    if (activeStoryCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 active stories allowed at a time' },
        { status: 400 }
      )
    }

    // Calculate expiration time
    const expiresAt = new Date(now.getTime() + validDuration * 60 * 60 * 1000)

    const story = await db.story.create({
      data: {
        authorId: authUser.userId,
        mediaUrl,
        mediaType: validMediaType,
        caption: caption || null,
        duration: validDuration,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        story: {
          id: story.id,
          mediaUrl: story.mediaUrl,
          mediaType: story.mediaType,
          caption: story.caption,
          duration: story.duration,
          createdAt: story.createdAt.toISOString(),
          expiresAt: story.expiresAt.toISOString(),
          author: {
            id: story.author.id,
            username: story.author.username,
            name: story.author.name,
            avatar: story.author.avatar,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Stories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/stories?storyId=xxx - Delete a story (only author can delete)
export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 })
    }

    const story = await db.story.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.authorId !== authUser.userId) {
      return NextResponse.json({ error: 'Only the author can delete their story' }, { status: 403 })
    }

    await db.story.delete({ where: { id: storyId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stories DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
