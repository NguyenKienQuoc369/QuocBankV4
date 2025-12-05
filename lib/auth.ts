import { SignJWT, jwtVerify } from 'jose'
// Thay thế bcryptjs bằng bcrypt-ts để hỗ trợ Edge Runtime (Vercel)
import { compare, hash } from 'bcrypt-ts'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export interface SessionUser {
  id: string
  username: string
  fullName: string
  avatarUrl?: string | null
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Create JWT token
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.user as SessionUser
  } catch (error) {
    return null
  }
}

// Get session from cookie
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete('session')
}

// Get user with account info
export async function getUserWithAccount(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: {
        include: {
          cards: true,
        },
      },
    },
  })
}