'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/actions/auth'
import { Scene } from '@/components/3d/Scene'
import { DashboardScene } from '@/components/3d/DashboardScene'
import { NotificationBell } from '@/components/NotificationBell'
import { formatVND, formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { SessionUser } from '@/lib/auth'
import type { AccountInfo } from '@/actions/banking'

interface Transaction {
  id: string
  amount: number
  message: string | null
  createdAt: Date
  status: string
  type: string
  fromUser: string
  toUser: string
  fromAccountNumber: string
  toAccountNumber: string
}

interface DashboardClientProps {
  user: SessionUser
  account: AccountInfo
  transactions: Transaction[]
}

export function DashboardClient({
  user,
  account,
  transactions,
}: DashboardClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const handleTransfer = () => {
    router.push('/transfer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quoc-black via-gray-900 to-quoc-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-quoc-neon">QUOCBANK</h1>
            <div className="text-sm text-gray-400">
              <p>Xin chào, {user.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />
            
            <button
              onClick={handleTransfer}
              className="px-6 py-2 bg-quoc-neon text-quoc-black font-semibold rounded-lg hover:bg-quoc-neon-dark transition-colors"
            >
              Chuyển tiền
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <a
            href="/savings"
            className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
            <p className="text-white font-semibold">Tiết kiệm</p>
            <p className="text-xs text-gray-400 mt-1">Gửi tiết kiệm</p>
          </a>
          
          <a
            href="/bills"
            className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
            <p className="text-white font-semibold">Hóa đơn</p>
            <p className="text-xs text-gray-400 mt-1">Thanh toán</p>
          </a>
          
          <a
            href="/scheduled-transfers"
            className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🗓️</div>
            <p className="text-white font-semibold">Định kỳ</p>
            <p className="text-xs text-gray-400 mt-1">Chuyển tiền</p>
          </a>
          
          <a
            href="/qr-payment"
            className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📱</div>
            <p className="text-white font-semibold">QR Code</p>
            <p className="text-xs text-gray-400 mt-1">Thanh toán</p>
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[600px] glass-effect rounded-2xl overflow-hidden"
          >
            <Scene>
              <DashboardScene balance={account.balance} userName={user.fullName} />
            </Scene>
          </motion.div>

          {/* Account Info & Transactions */}
          <div className="space-y-6">
            {/* Account Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Thông tin tài khoản
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Số tài khoản:</span>
                  <span className="text-white font-mono">
                    {account.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Loại tài khoản:</span>
                  <span className="text-white">
                    {account.type === 'PAYMENT' ? 'Thanh toán' : 'Tiết kiệm'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trạng thái:</span>
                  <span className="text-quoc-neon">
                    {account.status === 'ACTIVE' ? 'Hoạt động' : 'Đóng băng'}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-lg">Số dư:</span>
                    <span className="text-quoc-neon text-2xl font-bold">
                      {formatVND(account.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Giao dịch gần đây
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Chưa có giao dịch nào
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {tx.type === 'SENT' ? '↑ Chuyển đến' : '↓ Nhận từ'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {tx.type === 'SENT' ? tx.toUser : tx.fromUser}
                          </p>
                          {tx.message && (
                            <p className="text-sm text-gray-500 mt-1">
                              {tx.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.type === 'SENT'
                                ? 'text-red-400'
                                : 'text-quoc-neon'
                            }`}
                          >
                            {tx.type === 'SENT' ? '-' : '+'}
                            {formatVND(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
