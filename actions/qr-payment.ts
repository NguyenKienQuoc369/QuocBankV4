'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import QRCode from 'qrcode'
import { transferMoney } from './banking'

export interface QRPaymentData {
  accountNumber: string
  accountName: string
  amount?: number
  message?: string
  timestamp: number
}

export interface QRResult {
  success: boolean
  message: string
  qrCode?: string
  data?: QRPaymentData
}

// Tạo mã QR để nhận tiền
export async function generateQRCode(
  amount?: number,
  message?: string
): Promise<QRResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Get user's account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.id,
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

    if (!account) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản',
      }
    }

    // Create QR data
    const qrData: QRPaymentData = {
      accountNumber: account.accountNumber,
      accountName: account.user.fullName,
      amount,
      message,
      timestamp: Date.now(),
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    })

    return {
      success: true,
      message: 'Tạo mã QR thành công',
      qrCode: qrCodeDataURL,
      data: qrData,
    }
  } catch (error: any) {
    console.error('Generate QR code error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi tạo mã QR',
    }
  }
}

// Parse QR code data
export async function parseQRCode(qrDataString: string): Promise<QRResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Parse QR data
    let qrData: QRPaymentData
    try {
      qrData = JSON.parse(qrDataString)
    } catch {
      return {
        success: false,
        message: 'Mã QR không hợp lệ',
      }
    }

    // Validate QR data structure
    if (
      !qrData.accountNumber ||
      !qrData.accountName ||
      !qrData.timestamp
    ) {
      return {
        success: false,
        message: 'Mã QR không đúng định dạng',
      }
    }

    // Check if QR is not too old (valid for 15 minutes)
    const now = Date.now()
    const qrAge = now - qrData.timestamp
    const maxAge = 15 * 60 * 1000 // 15 minutes

    if (qrAge > maxAge) {
      return {
        success: false,
        message: 'Mã QR đã hết hạn',
      }
    }

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: {
        accountNumber: qrData.accountNumber,
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

    if (!account) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại',
      }
    }

    // Verify account name matches
    if (account.user.fullName !== qrData.accountName) {
      return {
        success: false,
        message: 'Thông tin tài khoản không khớp',
      }
    }

    return {
      success: true,
      message: 'Quét mã QR thành công',
      data: qrData,
    }
  } catch (error: any) {
    console.error('Parse QR code error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi quét mã QR',
    }
  }
}

// Xử lý thanh toán QR
export async function processQRPayment(
  qrDataString: string,
  amount?: number,
  message?: string
): Promise<QRResult> {
  try {
    const session = await getSession()
    if (!session) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện',
      }
    }

    // Parse and validate QR code
    const parseResult = await parseQRCode(qrDataString)
    if (!parseResult.success || !parseResult.data) {
      return parseResult
    }

    const qrData = parseResult.data

    // Determine amount to transfer
    const transferAmount = amount || qrData.amount
    if (!transferAmount || transferAmount <= 0) {
      return {
        success: false,
        message: 'Vui lòng nhập số tiền',
      }
    }

    // Determine message
    const transferMessage = message || qrData.message || 'Thanh toán QR'

    // Execute transfer
    const transferResult = await transferMoney(
      qrData.accountNumber,
      transferAmount,
      transferMessage
    )

    if (!transferResult.success) {
      return {
        success: false,
        message: transferResult.message,
      }
    }

    return {
      success: true,
      message: 'Thanh toán thành công',
      data: qrData,
    }
  } catch (error: any) {
    console.error('Process QR payment error:', error)
    return {
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi thanh toán',
    }
  }
}

// Tạo QR code tĩnh cho tài khoản (không có số tiền)
export async function generateStaticQRCode(): Promise<QRResult> {
  return generateQRCode()
}

// Tạo QR code động với số tiền cụ thể
export async function generateDynamicQRCode(
  amount: number,
  message?: string
): Promise<QRResult> {
  if (amount <= 0) {
    return {
      success: false,
      message: 'Số tiền không hợp lệ',
    }
  }

  if (amount > 1000000000) {
    return {
      success: false,
      message: 'Số tiền tối đa là 1,000,000,000 VND',
    }
  }

  return generateQRCode(amount, message)
}
