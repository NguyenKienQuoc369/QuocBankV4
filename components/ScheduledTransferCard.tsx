'use client'

import { motion } from 'framer-motion'
import { formatVND } from '@/lib/utils'
import type { ScheduledTransferInfo } from '@/actions/scheduled-transfers'

interface ScheduledTransferCardProps {
  transfer: ScheduledTransferInfo
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ScheduledTransferCard({
  transfer,
  onPause,
  onResume,
  onDelete,
}: ScheduledTransferCardProps) {
  const getFrequencyName = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return 'Hàng ngày'
      case 'WEEKLY':
        return 'Hàng tuần'
      case 'MONTHLY':
        return 'Hàng tháng'
      default:
        return frequency
    }
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return '📅'
      case 'WEEKLY':
        return '📆'
      case 'MONTHLY':
        return '🗓️'
      default:
        return '⏰'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PAUSED':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động'
      case 'PAUSED':
        return 'Tạm dừng'
      case 'COMPLETED':
        return 'Đã hoàn thành'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const isActive = transfer.status === 'ACTIVE'
  const isPaused = transfer.status === 'PAUSED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getFrequencyIcon(transfer.frequency)}</div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {getFrequencyName(transfer.frequency)}
            </h3>
            <p className="text-sm text-gray-400">
              Đã chạy {transfer.runCount} lần
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            transfer.status
          )}`}
        >
          {getStatusName(transfer.status)}
        </span>
      </div>

      {/* Amount */}
      <div className="mb-4 p-4 bg-quoc-neon/10 rounded-lg border border-quoc-neon/20">
        <p className="text-sm text-gray-400">Số tiền chuyển</p>
        <p className="text-2xl font-bold text-quoc-neon mt-1">
          {formatVND(transfer.amount)}
        </p>
      </div>

      {/* Recipient */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Người nhận</p>
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-quoc-neon/20 flex items-center justify-center text-quoc-neon font-bold">
            {transfer.toAccountName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">{transfer.toAccountName}</p>
            <p className="text-sm text-gray-400 font-mono">
              {transfer.toAccountNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {transfer.message && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Nội dung</p>
          <p className="text-white">{transfer.message}</p>
        </div>
      )}

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-400">Ngày bắt đầu</p>
          <p className="text-white font-medium mt-1">
            {new Date(transfer.startDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
        {transfer.endDate && (
          <div>
            <p className="text-gray-400">Ngày kết thúc</p>
            <p className="text-white font-medium mt-1">
              {new Date(transfer.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}
      </div>

      {/* Next Run */}
      {(isActive || isPaused) && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-gray-400">Lần chạy tiếp theo</p>
          <p className="text-white font-semibold mt-1">
            {new Date(transfer.nextRunDate).toLocaleString('vi-VN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      )}

      {/* Last Run */}
      {transfer.lastRunAt && (
        <div className="mb-4 text-sm">
          <p className="text-gray-400">
            Lần chạy gần nhất:{' '}
            <span className="text-white">
              {new Date(transfer.lastRunAt).toLocaleString('vi-VN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      {(isActive || isPaused) && (
        <div className="flex gap-2">
          {isActive && onPause && (
            <button
              onClick={() => onPause(transfer.id)}
              className="flex-1 py-2 px-4 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tạm dừng
            </button>
          )}

          {isPaused && onResume && (
            <button
              onClick={() => onResume(transfer.id)}
              className="flex-1 py-2 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tiếp tục
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(transfer.id)}
              className="py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
