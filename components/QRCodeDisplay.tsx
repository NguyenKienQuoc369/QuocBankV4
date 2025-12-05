'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateStaticQRCode, generateDynamicQRCode } from '@/actions/qr-payment'
import { formatVND } from '@/lib/utils'
import type { QRResult } from '@/actions/qr-payment'

export function QRCodeDisplay() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrData, setQrData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'static' | 'dynamic'>('static')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const handleGenerateStatic = async () => {
    setIsLoading(true)
    const result = await generateStaticQRCode()
    if (result.success && result.qrCode) {
      setQrCode(result.qrCode)
      setQrData(result.data)
    }
    setIsLoading(false)
  }

  const handleGenerateDynamic = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ')
      return
    }

    setIsLoading(true)
    const result = await generateDynamicQRCode(amountNum, message || undefined)
    if (result.success && result.qrCode) {
      setQrCode(result.qrCode)
      setQrData(result.data)
    }
    setIsLoading(false)
  }

  const handleDownload = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `quocbank-qr-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => {
            setMode('static')
            setQrCode(null)
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
            mode === 'static'
              ? 'bg-quoc-neon text-quoc-black'
              : 'text-white hover:bg-white/10'
          }`}
        >
          Mã QR tĩnh
        </button>
        <button
          onClick={() => {
            setMode('dynamic')
            setQrCode(null)
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
            mode === 'dynamic'
              ? 'bg-quoc-neon text-quoc-black'
              : 'text-white hover:bg-white/10'
          }`}
        >
          Mã QR động
        </button>
      </div>

      {/* Description */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-blue-300">
          {mode === 'static'
            ? '💡 Mã QR tĩnh: Người quét sẽ tự nhập số tiền muốn chuyển'
            : '💡 Mã QR động: Số tiền đã được cố định, người quét chỉ cần xác nhận'}
        </p>
      </div>

      {/* Dynamic Mode Form */}
      {mode === 'dynamic' && !qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Số tiền <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-quoc-neon transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nội dung (tùy chọn)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ví dụ: Thanh toán đơn hàng #123"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-quoc-neon transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      {!qrCode && (
        <button
          onClick={mode === 'static' ? handleGenerateStatic : handleGenerateDynamic}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-quoc-neon text-quoc-black font-bold rounded-lg hover:bg-quoc-neon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tạo mã QR...' : 'Tạo mã QR'}
        </button>
      )}

      {/* QR Code Display */}
      {qrCode && qrData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* QR Code Image */}
          <div className="p-6 bg-white rounded-2xl">
            <img
              src={qrCode}
              alt="QR Code"
              className="w-full h-auto"
            />
          </div>

          {/* QR Info */}
          <div className="glass-effect rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tài khoản</span>
              <span className="text-white font-mono">{qrData.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tên</span>
              <span className="text-white font-semibold">{qrData.accountName}</span>
            </div>
            {qrData.amount && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Số tiền</span>
                <span className="text-quoc-neon font-bold text-lg">
                  {formatVND(qrData.amount)}
                </span>
              </div>
            )}
            {qrData.message && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Nội dung</span>
                <span className="text-white">{qrData.message}</span>
              </div>
            )}
          </div>

          {/* Expiry Warning */}
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-yellow-300">
              Mã QR này có hiệu lực trong 15 phút
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Tải xuống
            </button>
            <button
              onClick={() => {
                setQrCode(null)
                setQrData(null)
                setAmount('')
                setMessage('')
              }}
              className="flex-1 py-3 px-6 bg-quoc-neon text-quoc-black font-semibold rounded-lg hover:bg-quoc-neon-dark transition-colors"
            >
              Tạo mã mới
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
