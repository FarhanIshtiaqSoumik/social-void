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

// GET /api/stories/[id] - Get a specific user's active stories
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify the target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, avatar: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()

    // If viewing someone else's stories, check if they are friends (mutual follow) or it's the user themselves
    if (userId !== authUser.userId) {
      const iFollow = await db.follow.findFirst({
        where: { followerId: authUser.userId, followingId: userId },
      })
      const followsMe = await db.follow.findFirst({
        where: { followerId: userId, followingId: authUser.userId },
      })

      // Only friends (mutual follows) can see each other's stories
      if (!iFollow || !followsMe) {
        // Allow viewing if at least one follows the other (more permissive)
        // but the main feed only shows friends' stories
        // Here we allow viewing anyone's active stories if you follow them
        if (!iFollow) {
          return NextResponse.json({ error: 'You must follow this user to view their stories' }, { status: 403 })
        }
      }
    }

    // Fetch active stories for this user
    const stories = await db.story.findMany({
      where: {
        authorId: userId,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    const serializedStories = stories.map((story) => ({
      id: story.id,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      caption: story.caption,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
    }))

    return NextResponse.json({
      stories: serializedStories,
      author: targetUser,
    })
  } catch (error) {
    console.error('Stories [id] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
