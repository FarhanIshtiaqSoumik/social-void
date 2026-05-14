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

    const blocks = await db.userBlock.findMany({
      where: { blockerId: authUser.userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const blockedUsers = blocks.map((block) => ({
      id: block.id,
      createdAt: block.createdAt,
      user: block.blocked,
    }))

    return NextResponse.json({ blockedUsers })
  } catch (error) {
    console.error('Blocks GET error:', error)
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (userId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    // Verify the target user exists
    const targetUser = await db.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already blocked
    const existingBlock = await db.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: authUser.userId,
          blockedId: userId,
        },
      },
    })

    if (existingBlock) {
      return NextResponse.json({ error: 'User is already blocked' }, { status: 409 })
    }

    const block = await db.userBlock.create({
      data: {
        blockerId: authUser.userId,
        blockedId: userId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error('Blocks POST error:', error)
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

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const block = await db.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: authUser.userId,
          blockedId: userId,
        },
      },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    await db.userBlock.delete({
      where: { id: block.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blocks DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
