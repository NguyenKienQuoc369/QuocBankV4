'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { transferMoney } from './banking'

export interface ScheduledTransferResult {
  success: boolean
  message: string
  scheduledTransferId?: string
}

export interface ScheduledTransferInfo {
  id: string
  toAccountNumber: string
  toAccountName: string
  amount: number
  frequency: string
  startDate: Date
  endDate: Date | null
  nextRunDate: Date
  message: string | null
  status: string
  lastRunAt: Date | null
  runCount: number
  createdAt: Date
}

// Tính ngày chạy tiếp theo
function calculateNextRunDate(
  currentDate: Date,
  frequency: string
): Date {
  const nextDate = new Date(currentDate)
  
  switch (frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
  }
  
  return nextDate
}

// Tạo lịch chuyển tiền định kỳ
export async function createScheduledTransfer(
  toAccountNumber: string,
  amount: number,
  frequency: string,
  startDate: Date,
  endDate?: Date,
  message?: string
): Promise<ScheduledTransferResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Validate frequency
    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(frequency)) {
      return {
        success: false,
        message: 'Tần suất không hợp lệ',
      }
    }

    // Validate amount
    if (amount <= 0) {
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

    // Validate dates
    const now = new Date()
    if (startDate < now) {
      return {
        success: false,
        message: 'Ngày bắt đầu phải từ hôm nay trở đi',
      }
    }

    if (endDate && endDate <= startDate) {
      return {
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
      }
    }

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

      // Check if sending to self
      if (account.accountNumber === toAccountNumber) {
        throw new Error('Không thể tạo lịch chuyển tiền cho chính mình')
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

      // Create scheduled transfer
      const scheduledTransfer = await tx.scheduledTransfer.create({
        data: {
          fromAccountId: account.id,
          toAccountNumber,
          toAccountName: toAccount.user.fullName,
          amount,
          frequency,
          startDate,
          endDate,
          nextRunDate: startDate,
          message: message || 'Chuyển tiền định kỳ',
          status: 'ACTIVE',
        },
      })

      return scheduledTransfer
    })

    // Create notification
    await createNotification(
      session.id,
      'SYSTEM',
      'Tạo lịch chuyển tiền thành công',
      `Lịch chuyển ${amount.toLocaleString('vi-VN')} VND ${frequency === 'DAILY' ? 'hàng ngày' : frequency === 'WEEKLY' ? 'hàng tuần' : 'hàng tháng'} đến ${result.toAccountName}`
    )

    revalidatePath('/scheduled-transfers')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Tạo lịch chuyển tiền thành công',
      scheduledTransferId: result.id,
    }
  } catch (error: any) {
    console.error('Create scheduled transfer error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi tạo lịch',
    }
  }
}

// Lấy danh sách lịch chuyển tiền
export async function getScheduledTransfers(): Promise<ScheduledTransferInfo[]> {
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

    const scheduledTransfers = await prisma.scheduledTransfer.findMany({
      where: {
        fromAccountId: account.id,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
      orderBy: {
        nextRunDate: 'asc',
      },
    })

    return scheduledTransfers.map((st: any) => ({
      id: st.id,
      toAccountNumber: st.toAccountNumber,
      toAccountName: st.toAccountName,
      amount: st.amount,
      frequency: st.frequency,
      startDate: st.startDate,
      endDate: st.endDate,
      nextRunDate: st.nextRunDate,
      message: st.message,
      status: st.status,
      lastRunAt: st.lastRunAt,
      runCount: st.runCount,
      createdAt: st.createdAt,
    }))
  } catch (error) {
    console.error('Get scheduled transfers error:', error)
    return []
  }
}

// Tạm dừng lịch chuyển tiền
export async function pauseScheduledTransfer(
  scheduledTransferId: string
): Promise<ScheduledTransferResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản',
      }
    }

    // Verify ownership
    const scheduledTransfer = await prisma.scheduledTransfer.findUnique({
      where: { id: scheduledTransferId },
    })

    if (!scheduledTransfer || scheduledTransfer.fromAccountId !== account.id) {
      return {
        success: false,
        message: 'Không tìm thấy lịch chuyển tiền',
      }
    }

    if (scheduledTransfer.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Lịch chuyển tiền không ở trạng thái hoạt động',
      }
    }

    await prisma.scheduledTransfer.update({
      where: { id: scheduledTransferId },
      data: {
        status: 'PAUSED',
      },
    })

    revalidatePath('/scheduled-transfers')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Đã tạm dừng lịch chuyển tiền',
    }
  } catch (error: any) {
    console.error('Pause scheduled transfer error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi',
    }
  }
}

// Tiếp tục lịch chuyển tiền
export async function resumeScheduledTransfer(
  scheduledTransferId: string
): Promise<ScheduledTransferResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản',
      }
    }

    // Verify ownership
    const scheduledTransfer = await prisma.scheduledTransfer.findUnique({
      where: { id: scheduledTransferId },
    })

    if (!scheduledTransfer || scheduledTransfer.fromAccountId !== account.id) {
      return {
        success: false,
        message: 'Không tìm thấy lịch chuyển tiền',
      }
    }

    if (scheduledTransfer.status !== 'PAUSED') {
      return {
        success: false,
        message: 'Lịch chuyển tiền không ở trạng thái tạm dừng',
      }
    }

    await prisma.scheduledTransfer.update({
      where: { id: scheduledTransferId },
      data: {
        status: 'ACTIVE',
      },
    })

    revalidatePath('/scheduled-transfers')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Đã tiếp tục lịch chuyển tiền',
    }
  } catch (error: any) {
    console.error('Resume scheduled transfer error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi',
    }
  }
}

// Xóa lịch chuyển tiền
export async function deleteScheduledTransfer(
  scheduledTransferId: string
): Promise<ScheduledTransferResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản',
      }
    }

    // Verify ownership
    const scheduledTransfer = await prisma.scheduledTransfer.findUnique({
      where: { id: scheduledTransferId },
    })

    if (!scheduledTransfer || scheduledTransfer.fromAccountId !== account.id) {
      return {
        success: false,
        message: 'Không tìm thấy lịch chuyển tiền',
      }
    }

    await prisma.scheduledTransfer.update({
      where: { id: scheduledTransferId },
      data: {
        status: 'CANCELLED',
      },
    })

    revalidatePath('/scheduled-transfers')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Đã xóa lịch chuyển tiền',
    }
  } catch (error: any) {
    console.error('Delete scheduled transfer error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi',
    }
  }
}

// Thực thi lịch chuyển tiền (được gọi bởi cron job)
export async function executeScheduledTransfers(): Promise<void> {
  try {
    const now = new Date()

    // Get all active scheduled transfers that are due
    const dueTransfers = await prisma.scheduledTransfer.findMany({
      where: {
        status: 'ACTIVE',
        nextRunDate: {
          lte: now,
        },
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    })

    for (const st of dueTransfers) {
      try {
        // Execute transfer
        const result = await transferMoney(
          st.toAccountNumber,
          st.amount,
          st.message || undefined
        )

        if (result.success) {
          // Calculate next run date
          const nextRunDate = calculateNextRunDate(st.nextRunDate, st.frequency)

          // Check if should complete
          let newStatus = st.status
          if (st.endDate && nextRunDate > st.endDate) {
            newStatus = 'COMPLETED'
          }

          // Update scheduled transfer
          await prisma.scheduledTransfer.update({
            where: { id: st.id },
            data: {
              lastRunAt: now,
              runCount: st.runCount + 1,
              nextRunDate: newStatus === 'COMPLETED' ? st.nextRunDate : nextRunDate,
              status: newStatus,
            },
          })

          // Create notification
          await createNotification(
            st.account.userId,
            'TRANSACTION',
            'Chuyển tiền định kỳ thành công',
            `Đã chuyển ${st.amount.toLocaleString('vi-VN')} VND đến ${st.toAccountName}`
          )
        } else {
          // Transfer failed - notify user
          await createNotification(
            st.account.userId,
            'TRANSACTION',
            'Chuyển tiền định kỳ thất bại',
            `Không thể chuyển ${st.amount.toLocaleString('vi-VN')} VND đến ${st.toAccountName}. Lý do: ${result.message}`
          )
        }
      } catch (error) {
        console.error(`Failed to execute scheduled transfer ${st.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Execute scheduled transfers error:', error)
  }
}
