import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to VND
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Generate random account number
export function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return timestamp + random
}

// Generate random card number
export function generateCardNumber(): string {
  const prefix = '4532' // Visa prefix
  const middle = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return prefix + middle + suffix
}

// Generate CVV
export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}

// Format date to Vietnamese
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} phút trước`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} giờ trước`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ngày trước`
  } else {
    return formatDate(d)
  }
}

// Mask account number (show only last 4 digits)
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber
  return '**** **** ' + accountNumber.slice(-4)
}

// Mask card number
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length !== 16) return cardNumber
  return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4)
}

// Validate account number format
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^\d{10}$/.test(accountNumber)
}

// Validate amount
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000000 && Number.isFinite(amount)
}
