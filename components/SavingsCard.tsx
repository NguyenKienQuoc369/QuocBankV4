'use client'

import { motion } from 'framer-motion'
import { formatVND, formatDate } from '@/lib/utils'
import type { SavingsAccountInfo } from '@/actions/savings'

interface SavingsCardProps {
  savings: SavingsAccountInfo
  onWithdraw?: (id: string) => void
}

export function SavingsCard({ savings, onWithdraw }: SavingsCardProps) {
  const getSavingsTypeName = (type: string) => {
    switch (type) {
      case 'FLEXIBLE':
        return 'Không kỳ hạn'
      case 'FIXED_1M':
        return 'Kỳ hạn 1 tháng'
      case 'FIXED_3M':
        return 'Kỳ hạn 3 tháng'
      case 'FIXED_6M':
        return 'Kỳ hạn 6 tháng'
      case 'FIXED_12M':
        return 'Kỳ hạn 12 tháng'
      default:
        return type
    }
  }

  const getProgressPercentage = () => {
    if (!savings.maturityDate) return 100 // Flexible savings
    
    const start = new Date(savings.startDate).getTime()
    const end = new Date(savings.maturityDate).getTime()
    const now = Date.now()
    
    const total = end - start
    const elapsed = now - start
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const isMatured = savings.daysRemaining !== null && savings.daysRemaining === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {getSavingsTypeName(savings.savingsType)}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Lãi suất: <span className="text-quoc-neon font-semibold">{savings.interestRate}%</span> /năm
          </p>
        </div>
        
        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isMatured
              ? 'bg-green-500/20 text-green-400'
              : savings.status === 'ACTIVE'
              ? 'bg-quoc-neon/20 text-quoc-neon'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {isMatured ? 'Đã đáo hạn' : savings.status === 'ACTIVE' ? 'Đang gửi' : 'Đã đóng'}
        </span>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-sm text-gray-400">Số dư gốc</p>
        <p className="text-3xl font-bold text-white mt-1">
          {formatVND(savings.balance)}
        </p>
      </div>

      {/* Estimated Interest */}
      <div className="mb-4 p-3 bg-quoc-neon/10 rounded-lg border border-quoc-neon/20">
        <p className="text-sm text-gray-400">Lãi dự kiến</p>
        <p className="text-xl font-bold text-quoc-neon mt-1">
          +{formatVND(savings.estimatedInterest)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tổng nhận: {formatVND(savings.balance + savings.estimatedInterest)}
        </p>
      </div>

      {/* Progress Bar (for fixed term) */}
      {savings.maturityDate && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Tiến độ</span>
            <span className="text-white font-semibold">
              {savings.daysRemaining !== null && savings.daysRemaining > 0
                ? `Còn ${savings.daysRemaining} ngày`
                : 'Đã đáo hạn'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isMatured ? 'bg-green-500' : 'bg-quoc-neon'
              }`}
            />
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-400">Ngày gửi</p>
          <p className="text-white font-medium mt-1">
            {new Date(savings.startDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
        {savings.maturityDate && (
          <div>
            <p className="text-gray-400">Ngày đáo hạn</p>
            <p className="text-white font-medium mt-1">
              {new Date(savings.maturityDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}
      </div>

      {/* Auto Renew Badge */}
      {savings.autoRenew && (
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Tự động gia hạn</span>
        </div>
      )}

      {/* Actions */}
      {savings.status === 'ACTIVE' && onWithdraw && (
        <div className="flex gap-2">
          <button
            onClick={() => onWithdraw(savings.id)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              isMatured
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isMatured ? 'Rút tiền + Lãi' : 'Rút trước hạn'}
          </button>
          
          {!savings.maturityDate && (
            <button
              onClick={() => onWithdraw(savings.id)}
              className="px-4 py-2 rounded-lg bg-quoc-neon text-quoc-black font-semibold hover:bg-quoc-neon-dark transition-colors"
            >
              Rút một phần
            </button>
          )}
        </div>
      )}

      {/* Warning for early withdrawal */}
      {!isMatured && savings.maturityDate && savings.status === 'ACTIVE' && (
        <p className="text-xs text-yellow-400 mt-2 flex items-start gap-1">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Rút trước hạn sẽ chỉ nhận lãi suất không kỳ hạn (0.5%/năm)</span>
        </p>
      )}
    </motion.div>
  )
}
