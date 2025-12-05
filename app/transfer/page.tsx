'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchAccountByNumber, transferMoney } from '@/actions/banking'
import { Scene } from '@/components/3d/Scene'
import { ParticleExplosion } from '@/components/3d/ParticleExplosion'
import { formatVND, isValidAccountNumber, isValidAmount } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function TransferPage() {
  const router = useRouter()
  const [accountNumber, setAccountNumber] = useState('')
  const [receiverInfo, setReceiverInfo] = useState<{
    fullName: string
    accountNumber: string
  } | null>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSearchAccount = async () => {
    if (!accountNumber) {
      setError('Vui lòng nhập số tài khoản')
      return
    }

    if (!isValidAccountNumber(accountNumber)) {
      setError('Số tài khoản phải có 10 chữ số')
      return
    }

    setSearching(true)
    setError('')

    try {
      const result = await searchAccountByNumber(accountNumber)

      if (result) {
        setReceiverInfo(result)
      } else {
        setError('Không tìm thấy tài khoản')
        setReceiverInfo(null)
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm kiếm')
    } finally {
      setSearching(false)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!receiverInfo) {
      setError('Vui lòng tìm kiếm tài khoản người nhận trước')
      return
    }

    const amountNum = parseFloat(amount)

    if (!isValidAmount(amountNum)) {
      setError('Số tiền không hợp lệ (tối đa 1,000,000,000 VND)')
      return
    }

    setLoading(true)

    try {
      const result = await transferMoney(
        receiverInfo.accountNumber,
        amountNum,
        message || undefined
      )

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi chuyển tiền')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quoc-black via-gray-900 to-quoc-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-quoc-neon">Chuyển tiền</h1>
          </div>
        </div>
      </header>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <div className="relative w-full h-full">
              <Scene>
                <ParticleExplosion />
              </Scene>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">✓</div>
                  <h2 className="text-3xl font-bold text-quoc-neon mb-2">
                    Chuyển tiền thành công!
                  </h2>
                  <p className="text-gray-400">Đang chuyển về trang chủ...</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-20 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-8"
          >
            <form onSubmit={handleTransfer} className="space-y-6">
              {/* Search Account */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tài khoản người nhận
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value)
                      setReceiverInfo(null)
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-quoc-neon focus:border-transparent transition-all font-mono"
                    placeholder="0000000000"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={handleSearchAccount}
                    disabled={searching}
                    className="px-6 py-3 bg-quoc-neon/20 text-quoc-neon border border-quoc-neon rounded-lg hover:bg-quoc-neon/30 transition-colors disabled:opacity-50"
                  >
                    {searching ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </div>

              {/* Receiver Info */}
              {receiverInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-quoc-neon/10 border border-quoc-neon/50 rounded-lg"
                >
                  <p className="text-sm text-gray-400 mb-1">Người nhận:</p>
                  <p className="text-lg font-semibold text-white">
                    {receiverInfo.fullName}
                  </p>
                </motion.div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-quoc-neon focus:border-transparent transition-all"
                  placeholder="0"
                  min="1"
                  max="1000000000"
                  required
                  disabled={!receiverInfo}
                />
                {amount && parseFloat(amount) > 0 && (
                  <p className="mt-2 text-sm text-gray-400">
                    {formatVND(parseFloat(amount))}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nội dung chuyển tiền (tùy chọn)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-quoc-neon focus:border-transparent transition-all"
                  placeholder="Nhập nội dung chuyển tiền"
                  maxLength={200}
                  disabled={!receiverInfo}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !receiverInfo}
                className="w-full py-3 bg-gradient-to-r from-quoc-neon to-quoc-neon-dark text-quoc-black font-semibold rounded-lg hover:shadow-lg hover:shadow-quoc-neon/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận chuyển tiền'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
