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
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'stats') {
      const [totalUsers, totalPosts, totalMessages, totalChats, totalReports, recentUsers] = await Promise.all([
        db.user.count(),
        db.post.count(),
        db.message.count(),
        db.chat.count(),
        db.report.count({ where: { status: 'pending' } }),
        db.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, username: true, name: true, avatar: true, createdAt: true },
        }),
      ])

      const activeUsers = await db.user.count({
        where: { lastSeen: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      })

      return NextResponse.json({
        totalUsers,
        activeUsers,
        totalPosts,
        totalMessages,
        totalChats,
        totalReports,
        recentUsers,
      })
    }

    if (type === 'users') {
      const users = await db.user.findMany({
        select: {
          id: true, username: true, name: true, email: true, avatar: true,
          isBanned: true, isSuspended: true, isShadowBanned: true, isVerified: true,
          createdAt: true, lastSeen: true,
          _count: { select: { posts: true, followers: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ users })
    }

    if (type === 'reports') {
      const reports = await db.report.findMany({
        where: { status: 'pending' },
        include: {
          reporter: { select: { id: true, username: true, name: true } },
          reportedUser: { select: { id: true, username: true, name: true } },
          reportedPost: { select: { id: true, caption: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ reports })
    }

    if (type === 'logs') {
      const logs = await db.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      return NextResponse.json({ logs })
    }

    if (type === 'engagement') {
      // Get posts per day for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const posts = await db.post.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      })

      const likes = await db.like.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      })

      const messages = await db.message.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      })

      // Group by day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const engagementData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        const dayStr = date.toDateString()
        return {
          day: days[date.getDay()],
          date: date.toLocaleDateString(),
          posts: posts.filter(p => new Date(p.createdAt).toDateString() === dayStr).length,
          likes: likes.filter(l => new Date(l.createdAt).toDateString() === dayStr).length,
          messages: messages.filter(m => new Date(m.createdAt).toDateString() === dayStr).length,
        }
      })

      return NextResponse.json({ engagementData })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Admin GET error:', error)
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
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userId, reportId, data } = body

    if (action === 'ban' && userId) {
      await db.user.update({ where: { id: userId }, data: { isBanned: true } })
      return NextResponse.json({ success: true })
    }
    if (action === 'unban' && userId) {
      await db.user.update({ where: { id: userId }, data: { isBanned: false } })
      return NextResponse.json({ success: true })
    }
    if (action === 'suspend' && userId) {
      await db.user.update({ where: { id: userId }, data: { isSuspended: true } })
      return NextResponse.json({ success: true })
    }
    if (action === 'unsuspend' && userId) {
      await db.user.update({ where: { id: userId }, data: { isSuspended: false } })
      return NextResponse.json({ success: true })
    }
    if (action === 'shadow-ban' && userId) {
      await db.user.update({ where: { id: userId }, data: { isShadowBanned: true } })
      return NextResponse.json({ success: true })
    }
    if (action === 'unshadow-ban' && userId) {
      await db.user.update({ where: { id: userId }, data: { isShadowBanned: false } })
      return NextResponse.json({ success: true })
    }
    if (action === 'verify' && userId) {
      await db.user.update({ where: { id: userId }, data: { isVerified: true } })
      return NextResponse.json({ success: true })
    }
    if (action === 'resolve-report' && reportId) {
      await db.report.update({
        where: { id: reportId },
        data: { status: 'resolved', resolvedAt: new Date() },
      })
      return NextResponse.json({ success: true })
    }
    if (action === 'delete-post') {
      const { postId } = body
      if (postId) {
        await db.post.delete({ where: { id: postId } })
        return NextResponse.json({ success: true })
      }
    }
    if (action === 'log') {
      const { level, message, path, statusCode } = body
      await db.systemLog.create({
        data: { level: level || 'info', message, path, statusCode },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
