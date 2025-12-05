'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export interface BillResult {
  success: boolean
  message: string
  billPaymentId?: string
}

export interface BillProviderInfo {
  id: string
  name: string
  category: string
  logo: string | null
  description: string | null
}

export interface BillPaymentInfo {
  id: string
  provider: {
    name: string
    category: string
    logo: string | null
  }
  customerCode: string
  amount: number
  billMonth: string | null
  description: string | null
  status: string
  createdAt: Date
  paidAt: Date | null
}

// Lấy danh sách nhà cung cấp dịch vụ
export async function getBillProviders(
  category?: string
): Promise<BillProviderInfo[]> {
  try {
    const providers = await prisma.billProvider.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return providers.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      logo: p.logo,
      description: p.description,
    }))
  } catch (error) {
    console.error('Get bill providers error:', error)
    return []
  }
}

// Thanh toán hóa đơn
export async function payBill(
  providerId: string,
  customerCode: string,
  amount: number,
  billMonth?: string,
  description?: string
): Promise<BillResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        message: 'Số tiền không hợp lệ',
      }
    }

    if (amount > 100000000) {
      return {
        success: false,
        message: 'Số tiền thanh toán tối đa là 100,000,000 VND',
      }
    }

    // Validate customer code
    if (!customerCode || customerCode.trim().length === 0) {
      return {
        success: false,
        message: 'Vui lòng nhập mã khách hàng',
      }
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Get provider
      const provider = await tx.billProvider.findUnique({
        where: { id: providerId },
      })

      if (!provider || !provider.isActive) {
        throw new Error('Nhà cung cấp không tồn tại hoặc không hoạt động')
      }

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
        throw new Error('Số dư không đủ để thanh toán')
      }

      // Deduct from account
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })

      // Create bill payment record
      const billPayment = await tx.billPayment.create({
        data: {
          accountId: account.id,
          providerId,
          customerCode: customerCode.trim(),
          amount,
          billMonth,
          description,
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: account.id,
          toAccountId: account.id, // Self transaction for bill payment
          amount,
          message: `Thanh toán ${provider.name} - ${customerCode}`,
          status: 'SUCCESS',
        },
      })

      // Update bill payment with transaction ID
      await tx.billPayment.update({
        where: { id: billPayment.id },
        data: {
          transactionId: transaction.id,
        },
      })

      return { billPayment, provider }
    })

    // Create notification
    await createNotification(
      session.id,
      'BILL',
      'Thanh toán hóa đơn thành công',
      `Bạn đã thanh toán ${amount.toLocaleString('vi-VN')} VND cho ${result.provider.name}`
    )

    revalidatePath('/bills')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Thanh toán hóa đơn thành công',
      billPaymentId: result.billPayment.id,
    }
  } catch (error: any) {
    console.error('Pay bill error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi thanh toán',
    }
  }
}

// Lấy lịch sử thanh toán hóa đơn
export async function getBillHistory(limit: number = 20): Promise<BillPaymentInfo[]> {
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

    const bills = await prisma.billPayment.findMany({
      where: {
        accountId: account.id,
      },
      include: {
        provider: {
          select: {
            name: true,
            category: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return bills.map((b: any) => ({
      id: b.id,
      provider: {
        name: b.provider.name,
        category: b.provider.category,
        logo: b.provider.logo,
      },
      customerCode: b.customerCode,
      amount: b.amount,
      billMonth: b.billMonth,
      description: b.description,
      status: b.status,
      createdAt: b.createdAt,
      paidAt: b.paidAt,
    }))
  } catch (error) {
    console.error('Get bill history error:', error)
    return []
  }
}

// Lưu mẫu hóa đơn thường dùng (saved templates)
// Sử dụng description field để lưu template name
export async function saveBillTemplate(
  providerId: string,
  customerCode: string,
  templateName: string
): Promise<BillResult> {
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

    // Create a pending bill payment as template
    const template = await prisma.billPayment.create({
      data: {
        accountId: account.id,
        providerId,
        customerCode,
        amount: 0, // Template has no amount
        description: `TEMPLATE:${templateName}`,
        status: 'PENDING',
      },
    })

    revalidatePath('/bills')

    return {
      success: true,
      message: 'Lưu mẫu thành công',
      billPaymentId: template.id,
    }
  } catch (error: any) {
    console.error('Save bill template error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi lưu mẫu',
    }
  }
}

// Lấy danh sách mẫu hóa đơn
export async function getBillTemplates(): Promise<BillPaymentInfo[]> {
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

    const templates = await prisma.billPayment.findMany({
      where: {
        accountId: account.id,
        status: 'PENDING',
        description: {
          startsWith: 'TEMPLATE:',
        },
      },
      include: {
        provider: {
          select: {
            name: true,
            category: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return templates.map((t: any) => ({
      id: t.id,
      provider: {
        name: t.provider.name,
        category: t.provider.category,
        logo: t.provider.logo,
      },
      customerCode: t.customerCode,
      amount: t.amount,
      billMonth: t.billMonth,
      description: t.description?.replace('TEMPLATE:', ''),
      status: t.status,
      createdAt: t.createdAt,
      paidAt: t.paidAt,
    }))
  } catch (error) {
    console.error('Get bill templates error:', error)
    return []
  }
}

// Xóa mẫu hóa đơn
export async function deleteBillTemplate(templateId: string): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
        status: 'ACTIVE',
      },
    })

    if (!account) return false

    // Verify ownership and that it's a template
    const template = await prisma.billPayment.findUnique({
      where: { id: templateId },
    })

    if (
      !template ||
      template.accountId !== account.id ||
      !template.description?.startsWith('TEMPLATE:')
    ) {
      return false
    }

    await prisma.billPayment.delete({
      where: { id: templateId },
    })

    revalidatePath('/bills')

    return true
  } catch (error) {
    console.error('Delete bill template error:', error)
    return false
  }
}
