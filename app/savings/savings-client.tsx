'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SavingsCard } from '@/components/SavingsCard'
import { NotificationBell } from '@/components/NotificationBell'
import { formatVND } from '@/lib/utils'
import { createSavingsAccount, withdrawFromSavings } from '@/actions/savings'
import type { SessionUser } from '@/lib/auth'
import type { AccountInfo } from '@/actions/banking'
import type { SavingsAccountInfo } from '@/actions/savings'

interface SavingsClientProps {
  user: SessionUser
  account: AccountInfo
  savingsAccounts: SavingsAccountInfo[]
  totalSavings: number
}

export function SavingsClient({
  user,
  account,
  savingsAccounts: initialSavings,
  totalSavings: initialTotal,
}: SavingsClientProps) {
  const router = useRouter()
  const [savingsAccounts, setSavingsAccounts] = useState(initialSavings)
  const [totalSavings, setTotalSavings] = useState(initialTotal)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [savingsType, setSavingsType] = useState('FLEXIBLE')
  const [amount, setAmount] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)

  const handleCreateSavings = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum < 1000000) {
      alert('Số tiền gửi tối thiểu là 1,000,000 VND')
      return
    }

    if (amountNum > account.balance) {
      alert('Số dư không đủ')
      return
    }

    setIsLoading(true)
    const result = await createSavingsAccount(savingsType, amountNum, autoRenew)
    
    if (result.success) {
      alert(result.message)
      setShowCreateForm(false)
      setAmount('')
      router.refresh()
    } else {
      alert(result.message)
    }
    
    setIsLoading(false)
  }

  const handleWithdraw = async (id: string) => {
    if (!confirm('Bạn có chắc muốn rút tiền từ tài khoản tiết kiệm này?')) {
      return
    }

    setIsLoading(true)
    const result = await withdrawFromSavings(id)
    
    if (result.success) {
      alert(result.message)
      router.refresh()
    } else {
      alert(result.message)
    }
    
    setIsLoading(false)
  }

  const savingsTypes = [
    { value: 'FLEXIBLE', name: 'Không kỳ hạn', rate: 0.5 },
    { value: 'FIXED_1M', name: 'Kỳ hạn 1 tháng', rate: 3.5 },
    { value: 'FIXED_3M', name: 'Kỳ hạn 3 tháng', rate: 4.5 },
    { value: 'FIXED_6M', name: 'Kỳ hạn 6 tháng', rate: 5.5 },
    { value: 'FIXED_12M', name: 'Kỳ hạn 12 tháng', rate: 6.5 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-quoc-black via-gray-900 to-quoc-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-quoc-neon hover:text-quoc-neon-dark transition-colors"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-white">Tiết kiệm</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">Số dư tài khoản chính</p>
            <p className="text-3xl font-bold text-white">{formatVND(account.balance)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">Tổng tiết kiệm</p>
            <p className="text-3xl font-bold text-quoc-neon">{formatVND(totalSavings)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm mb-2">Số tài khoản tiết kiệm</p>
            <p className="text-3xl font-bold text-white">{savingsAccounts.length}</p>
          </motion.div>
        </div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full md:w-auto px-8 py-3 bg-quoc-neon text-quoc-black font-bold rounded-lg hover:bg-quoc-neon-dark transition-colors"
          >
            {showCreateForm ? '✕ Đóng' : '+ Tạo tài khoản tiết kiệm mới'}
          </button>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 glass-effect rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Gửi tiết kiệm mới</h2>
            
            <form onSubmit={handleCreateSavings} className="space-y-6">
              {/* Savings Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Loại tiết kiệm
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savingsTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSavingsType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        savingsType === type.value
                          ? 'border-quoc-neon bg-quoc-neon/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-white font-semibold">{type.name}</p>
                      <p className="text-quoc-neon text-lg font-bold mt-1">{type.rate}%/năm</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tiền gửi <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Tối thiểu 1,000,000 VND"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-quoc-neon transition-colors"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Số dư khả dụng: {formatVND(account.balance)}
                </p>
              </div>

              {/* Auto Renew */}
              {savingsType !== 'FLEXIBLE' && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-quoc-neon focus:ring-quoc-neon"
                  />
                  <label htmlFor="autoRenew" className="text-white">
                    Tự động gia hạn khi đáo hạn
                  </label>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-quoc-neon text-quoc-black font-bold rounded-lg hover:bg-quoc-neon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi tiết kiệm'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Savings Accounts List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Tài khoản tiết kiệm của bạn</h2>
          
          {savingsAccounts.length === 0 ? (
            <div className="glass-effect rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-xl text-white mb-2">Chưa có tài khoản tiết kiệm</p>
              <p className="text-gray-400">Tạo tài khoản tiết kiệm đầu tiên của bạn ngay!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savingsAccounts.map((savings) => (
                <SavingsCard
                  key={savings.id}
                  savings={savings}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
