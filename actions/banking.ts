'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export interface TransferResult {
  success: boolean
  message: string
  transactionId?: string
}

export interface AccountInfo {
  id: string
  accountNumber: string
  balance: number
  type: string
  status: string
  user: {
    fullName: string
    username: string
  }
}

// Get user's account
export async function getAccount(): Promise<AccountInfo | null> {
  try {
    const session = await getSession()
    if (!session) return null

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
          },
        },
      },
    })

    return account
  } catch (error) {
    console.error('Get account error:', error)
    return null
  }
}

// Search account by account number
export async function searchAccountByNumber(
  accountNumber: string
): Promise<{ fullName: string; accountNumber: string } | null> {
  try {
    if (!accountNumber || accountNumber.length !== 10) {
      return null
    }

    const account = await prisma.account.findUnique({
      where: {
        accountNumber,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    })

    if (!account) return null

    return {
      fullName: account.user.fullName,
      accountNumber: account.accountNumber,
    }
  } catch (error) {
    console.error('Search account error:', error)
    return null
  }
}

// Transfer money with ACID transaction
export async function transferMoney(
  toAccountNumber: string,
  amount: number,
  message?: string
): Promise<TransferResult> {
  try {
    // Validate session
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện giao dịch',
      }
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return {
        success: false,
        message: 'Số tiền không hợp lệ',
      }
    }

    if (amount > 1000000000) {
      return {
        success: false,
        message: 'Số tiền chuyển tối đa là 1,000,000,000 VND',
      }
    }

    // Validate account number
    if (!toAccountNumber || toAccountNumber.length !== 10) {
      return {
        success: false,
        message: 'Số tài khoản không hợp lệ',
      }
    }

    // Execute transfer in transaction (ACID compliance)
    const result = await prisma.$transaction(async (tx: any) => {
      // Get sender account
      const fromAccount = await tx.account.findFirst({
        where: {
          userId: session.id,
          status: 'ACTIVE',
        },
      })

      if (!fromAccount) {
        throw new Error('Không tìm thấy tài khoản của bạn')
      }

      // Check if sending to self
      if (fromAccount.accountNumber === toAccountNumber) {
        throw new Error('Không thể chuyển tiền cho chính mình')
      }

      // Check balance
      if (fromAccount.balance < amount) {
        throw new Error('Số dư không đủ để thực hiện giao dịch')
      }

      // Get receiver account
      const toAccount = await tx.account.findUnique({
        where: {
          accountNumber: toAccountNumber,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      })

      if (!toAccount) {
        throw new Error('Không tìm thấy tài khoản người nhận')
      }

      // Deduct from sender
      await tx.account.update({
        where: { id: fromAccount.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })

      // Add to receiver
      await tx.account.update({
        where: { id: toAccount.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount,
          message: message || 'Chuyển tiền',
          status: 'SUCCESS',
        },
      })

      return { transaction, fromAccount, toAccount }
    })

    // Create notifications for both sender and receiver
    await createNotification(
      session.id,
      'TRANSACTION',
      'Chuyển tiền thành công',
      `Bạn đã chuyển ${amount.toLocaleString('vi-VN')} VND đến ${result.toAccount.user.fullName}`
    )

    // Get receiver's user ID
    const receiverAccount = await prisma.account.findUnique({
      where: { accountNumber: toAccountNumber },
      select: { userId: true },
    })

    if (receiverAccount) {
      await createNotification(
        receiverAccount.userId,
        'TRANSACTION',
        'Nhận tiền',
        `Bạn đã nhận ${amount.toLocaleString('vi-VN')} VND từ ${session.fullName}`
      )
    }

    // Revalidate paths to update UI
    revalidatePath('/dashboard')
    revalidatePath('/transfer')

    return {
      success: true,
      message: 'Chuyển tiền thành công',
      transactionId: result.transaction.id,
    }
  } catch (error: any) {
    console.error('Transfer error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi chuyển tiền',
    }
  }
}

// Get transaction history
export async function getTransactionHistory(limit: number = 20) {
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

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: account.id },
          { toAccountId: account.id },
        ],
      },
      include: {
        fromAccount: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        toAccount: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return transactions.map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      message: tx.message,
      createdAt: tx.createdAt,
      status: tx.status,
      type: tx.fromAccountId === account.id ? 'SENT' : 'RECEIVED',
      fromUser: tx.fromAccount.user.fullName,
      toUser: tx.toAccount.user.fullName,
      fromAccountNumber: tx.fromAccount.accountNumber,
      toAccountNumber: tx.toAccount.accountNumber,
    }))
  } catch (error) {
    console.error('Get transaction history error:', error)
    return []
  }
}

// Get balance
export async function getBalance(): Promise<number | null> {
  try {
    const session = await getSession()
    if (!session) return null

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
      select: {
        balance: true,
      },
    })

    return account?.balance ?? null
  } catch (error) {
    console.error('Get balance error:', error)
    return null
  }
}
