'use server'

import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  verifyPassword,
  createToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  type SessionUser,
} from '@/lib/auth'
import { generateAccountNumber } from '@/lib/utils'
import { redirect } from 'next/navigation'

export interface AuthResult {
  success: boolean
  message: string
  user?: SessionUser
}

// Login action
export async function login(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!username || !password) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    })

    if (!user) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
      }
    }

    // Create session
    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    }

    const token = await createToken(sessionUser)
    await setSessionCookie(token)

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: sessionUser,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập',
    }
  }
}

// Register action
export async function register(
  username: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!username || !password || !fullName) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      }
    }

    if (username.length < 3) {
      return {
        success: false,
        message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
      }
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      }
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    })

    if (existingUser) {
      return {
        success: false,
        message: 'Tên đăng nhập đã tồn tại',
      }
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user and default account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username: username.toLowerCase().trim(),
          password_hash,
          fullName: fullName.trim(),
        },
      })

      // Create default payment account
      const account = await tx.account.create({
        data: {
          userId: user.id,
          accountNumber: generateAccountNumber(),
          balance: 0,
          type: 'PAYMENT',
          status: 'ACTIVE',
        },
      })

      return { user, account }
    })

    // Create session
    const sessionUser: SessionUser = {
      id: result.user.id,
      username: result.user.username,
      fullName: result.user.fullName,
      avatarUrl: result.user.avatarUrl,
    }

    const token = await createToken(sessionUser)
    await setSessionCookie(token)

    return {
      success: true,
      message: 'Đăng ký thành công',
      user: sessionUser,
    }
  } catch (error) {
    console.error('Register error:', error)
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký',
    }
  }
}

// Logout action
export async function logout() {
  await clearSessionCookie()
  redirect('/login')
}

// Get current session
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession()
}
