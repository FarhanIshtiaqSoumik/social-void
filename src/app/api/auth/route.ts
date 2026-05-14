import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, signToken, verifyToken, generateUsername } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'signup') {
      const { email, password, name, username: providedUsername } = body
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }

      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      // Validate and resolve username
      let username = providedUsername
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (username) {
        if (username.length < 3 || username.length > 20) {
          return NextResponse.json({ error: 'Username must be 3-20 characters', field: 'username' }, { status: 400 })
        }
        if (!usernameRegex.test(username)) {
          return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores', field: 'username' }, { status: 400 })
        }
        const existingUsername = await db.user.findUnique({ where: { username } })
        if (existingUsername) {
          return NextResponse.json({ error: 'Username is already taken', field: 'username' }, { status: 409 })
        }
      } else {
        // Fall back to generated username
        username = generateUsername(email)
        // Ensure generated username is unique
        let attempts = 0
        while (await db.user.findUnique({ where: { username } }) && attempts < 10) {
          username = generateUsername(email)
          attempts++
        }
      }

      const hashedPassword = await hashPassword(password)

      const user = await db.user.create({
        data: {
          email,
          username,
          name: name || username,
          password: hashedPassword,
        },
      })

      const token = signToken({ userId: user.id, email: user.email })
      const { password: _, ...safeUser } = user

      return NextResponse.json({ user: safeUser, token })
    }

    if (action === 'login') {
      const { email, password } = body
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }

      const user = await db.user.findUnique({ where: { email } })
      if (!user || !user.password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      if (user.isBanned) {
        return NextResponse.json({ error: 'This account has been banned' }, { status: 403 })
      }
      if (user.isSuspended) {
        return NextResponse.json({ error: 'This account has been suspended' }, { status: 403 })
      }

      const valid = await verifyPassword(password, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      await db.user.update({ where: { id: user.id }, data: { lastSeen: new Date() } })

      const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin })
      const { password: _, ...safeUser } = user

      return NextResponse.json({ user: safeUser, token })
    }

    if (action === 'admin-login') {
      const { email, password } = body
      if (email === 'admin@secret.com' && password === 'admin#123') {
        let adminUser = await db.user.findUnique({ where: { email: 'admin@secret.com' } })
        if (!adminUser) {
          const hashedPassword = await hashPassword('admin#123')
          adminUser = await db.user.create({
            data: {
              email: 'admin@secret.com',
              username: 'admin',
              name: 'Admin',
              password: hashedPassword,
              isAdmin: true,
              isVerified: true,
            },
          })
        }
        const token = signToken({ userId: adminUser.id, email: adminUser.email, isAdmin: true })
        const { password: _, ...safeUser } = adminUser
        return NextResponse.json({ user: safeUser, token })
      }
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    if (action === 'me') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      const user = await db.user.findUnique({ where: { id: decoded.userId } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      const { password: _, ...safeUser } = user
      return NextResponse.json({ user: safeUser })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
