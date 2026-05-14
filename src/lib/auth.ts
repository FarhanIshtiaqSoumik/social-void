import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'social-void-secret-key-2024'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { userId: string; email: string; isAdmin?: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; email: string; isAdmin?: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; isAdmin?: boolean }
  } catch {
    return null
  }
}

export function generateUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
  const random = Math.floor(Math.random() * 9999)
  return `${base}${random}`
}
