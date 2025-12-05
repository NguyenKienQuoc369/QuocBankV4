'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface SavingsResult {
  success: boolean
  message: string
  savingsAccountId?: string
}

export interface SavingsAccountInfo {
  id: string
  savingsType: string
  balance: number
  interestRate: number
  startDate: Date
  maturityDate: Date | null
  status: string
  autoRenew: boolean
  createdAt: Date
  estimatedInterest: number
  daysRemaining: number | null
}

// Lãi suất theo loại tiết kiệm
const INTEREST_RATES = {
  FLEXIBLE: 0.5, // 0.5% năm - Không kỳ hạn
  FIXED_1M: 3.5, // 3.5% năm - 1 tháng
  FIXED_3M: 4.5, // 4.5% năm - 3 tháng
  FIXED_6M: 5.5, // 5.5% năm - 6 tháng
  FIXED_12M: 6.5, // 6.5% năm - 12 tháng
}

// Tính ngày đáo hạn
function calculateMaturityDate(startDate: Date, savingsType: string): Date | null {
  if (savingsType === 'FLEXIBLE') return null

  const maturityDate = new Date(startDate)
  
  switch (savingsType) {
    case 'FIXED_1M':
      maturityDate.setMonth(maturityDate.getMonth() + 1)
      break
    case 'FIXED_3M':
      maturityDate.setMonth(maturityDate.getMonth() + 3)
      break
    case 'FIXED_6M':
      maturityDate.setMonth(maturityDate.getMonth() + 6)
      break
    case 'FIXED_12M':
      maturityDate.setFullYear(maturityDate.getFullYear() + 1)
      break
  }
  
  return maturityDate
}

// Tính lãi suất (helper function - không export)
function calculateInterest(
  principal: number,
  interestRate: number,
  days: number
): number {
  // Lãi suất đơn: P * r * t / 365
  return (principal * interestRate * days) / (365 * 100)
}

// Tạo tài khoản tiết kiệm
export async function createSavingsAccount(
  savingsType: string,
  amount: number,
  autoRenew: boolean = false
): Promise<SavingsResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Validate savings type
    if (!Object.keys(INTEREST_RATES).includes(savingsType)) {
      return {
        success: false,
        message: 'Loại tiết kiệm không hợp lệ',
      }
    }

    // Validate amount
    if (amount < 1000000) {
      return {
        success: false,
        message: 'Số tiền gửi tối thiểu là 1,000,000 VND',
      }
    }

    if (amount > 1000000000) {
      return {
        success: false,
        message: 'Số tiền gửi tối đa là 1,000,000,000 VND',
      }
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Get user's account
      const account = await tx.account.findFirst({
        where: {
          userId: session.id,
          status: 'ACTIVE',
        },
      })

      if (!account) {
        throw new Error('Không tìm thấy tài khoản của bạn')
      }

      // Check balance
      if (account.balance < amount) {
        throw new Error('Số dư không đủ để gửi tiết kiệm')
      }

      // Deduct from main account
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })

      // Create savings account
      const startDate = new Date()
      const maturityDate = calculateMaturityDate(startDate, savingsType)
      const interestRate = INTEREST_RATES[savingsType as keyof typeof INTEREST_RATES]

      const savingsAccount = await tx.savingsAccount.create({
        data: {
          accountId: account.id,
          savingsType,
          balance: amount,
          interestRate,
          startDate,
          maturityDate,
          autoRenew,
          status: 'ACTIVE',
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId: session.id,
          type: 'SAVINGS',
          title: 'Gửi tiết kiệm thành công',
          message: `Bạn đã gửi ${amount.toLocaleString('vi-VN')} VND vào tài khoản tiết kiệm với lãi suất ${interestRate}%/năm`,
        },
      })

      return savingsAccount
    })

    revalidatePath('/savings')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Gửi tiết kiệm thành công',
      savingsAccountId: result.id,
    }
  } catch (error: any) {
    console.error('Create savings account error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi gửi tiết kiệm',
    }
  }
}

// Rút tiền tiết kiệm
export async function withdrawFromSavings(
  savingsAccountId: string,
  amount?: number // Nếu không truyền thì rút toàn bộ
): Promise<SavingsResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Get savings account
      const savingsAccount = await tx.savingsAccount.findUnique({
        where: { id: savingsAccountId },
        include: {
          account: true,
        },
      })

      if (!savingsAccount) {
        throw new Error('Không tìm thấy tài khoản tiết kiệm')
      }

      if (savingsAccount.account.userId !== session.id) {
        throw new Error('Bạn không có quyền truy cập tài khoản này')
      }

      if (savingsAccount.status !== 'ACTIVE') {
        throw new Error('Tài khoản tiết kiệm không hoạt động')
      }

      const withdrawAmount = amount || savingsAccount.balance

      if (withdrawAmount > savingsAccount.balance) {
        throw new Error('Số tiền rút vượt quá số dư')
      }

      // Calculate interest
      const now = new Date()
      const daysPassed = Math.floor(
        (now.getTime() - savingsAccount.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      let interest = calculateInterest(
        savingsAccount.balance,
        savingsAccount.interestRate,
        daysPassed
      )

      // Penalty for early withdrawal (fixed term)
      let penalty = 0
      if (savingsAccount.maturityDate && now < savingsAccount.maturityDate) {
        // Rút trước hạn: chỉ nhận lãi suất không kỳ hạn
        const flexibleInterest = calculateInterest(
          savingsAccount.balance,
          INTEREST_RATES.FLEXIBLE,
          daysPassed
        )
        penalty = interest - flexibleInterest
        interest = flexibleInterest
      }

      const totalAmount = withdrawAmount + interest

      // Update savings account
      const newBalance = savingsAccount.balance - withdrawAmount
      if (newBalance === 0) {
        await tx.savingsAccount.update({
          where: { id: savingsAccountId },
          data: {
            balance: 0,
            status: 'CLOSED',
          },
        })
      } else {
        await tx.savingsAccount.update({
          where: { id: savingsAccountId },
          data: {
            balance: newBalance,
          },
        })
      }

      // Add to main account
      await tx.account.update({
        where: { id: savingsAccount.accountId },
        data: {
          balance: {
            increment: totalAmount,
          },
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId: session.id,
          type: 'SAVINGS',
          title: 'Rút tiết kiệm thành công',
          message: `Bạn đã rút ${withdrawAmount.toLocaleString('vi-VN')} VND + lãi ${interest.toLocaleString('vi-VN')} VND${penalty > 0 ? ` (phạt rút trước hạn: ${penalty.toLocaleString('vi-VN')} VND)` : ''}`,
        },
      })

      return { totalAmount, interest, penalty }
    })

    revalidatePath('/savings')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Rút tiền thành công. Tổng nhận: ${result.totalAmount.toLocaleString('vi-VN')} VND`,
    }
  } catch (error: any) {
    console.error('Withdraw from savings error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi rút tiền',
    }
  }
}

// Lấy danh sách tài khoản tiết kiệm
export async function getSavingsAccounts(): Promise<SavingsAccountInfo[]> {
  try {
    const session = await getSession()
    if (!session) return []

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) return []

    const savingsAccounts = await prisma.savingsAccount.findMany({
      where: {
        accountId: account.id,
        status: {
          in: ['ACTIVE', 'MATURED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const now = new Date()

    return savingsAccounts.map((sa: any) => {
      const daysPassed = Math.floor(
        (now.getTime() - sa.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      const estimatedInterest = calculateInterest(
        sa.balance,
        sa.interestRate,
        daysPassed
      )

      let daysRemaining = null
      if (sa.maturityDate) {
        daysRemaining = Math.max(
          0,
          Math.floor(
            (sa.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      }

      return {
        id: sa.id,
        savingsType: sa.savingsType,
        balance: sa.balance,
        interestRate: sa.interestRate,
        startDate: sa.startDate,
        maturityDate: sa.maturityDate,
        status: sa.status,
        autoRenew: sa.autoRenew,
        createdAt: sa.createdAt,
        estimatedInterest,
        daysRemaining,
      }
    })
  } catch (error) {
    console.error('Get savings accounts error:', error)
    return []
  }
}

// Đóng tài khoản tiết kiệm (rút toàn bộ)
export async function closeSavingsAccount(
  savingsAccountId: string
): Promise<SavingsResult> {
  return withdrawFromSavings(savingsAccountId)
}

// Lấy tổng số dư tiết kiệm
export async function getTotalSavingsBalance(): Promise<number> {
  try {
    const session = await getSession()
    if (!session) return 0

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) return 0

    const result = await prisma.savingsAccount.aggregate({
      where: {
        accountId: account.id,
        status: 'ACTIVE',
      },
      _sum: {
        balance: true,
      },
    })

    return result._sum.balance || 0
  } catch (error) {
    console.error('Get total savings balance error:', error)
    return 0
  }
}
