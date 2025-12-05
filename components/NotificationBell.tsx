'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/actions/notifications'
import { formatRelativeTime } from '@/lib/utils'
import type { NotificationInfo } from '@/actions/notifications'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true)
    const [notifs, count] = await Promise.all([
      getNotifications(10),
      getUnreadCount(),
    ])
    setNotifications(notifs)
    setUnreadCount(count)
    setIsLoading(false)
  }

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    await loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    await loadNotifications()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION':
        return '💸'
      case 'BILL':
        return '📄'
      case 'SAVINGS':
        return '💰'
      case 'SECURITY':
        return '🔒'
      case 'SYSTEM':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TRANSACTION':
        return 'text-quoc-neon'
      case 'BILL':
        return 'text-blue-400'
      case 'SAVINGS':
        return 'text-green-400'
      case 'SECURITY':
        return 'text-red-400'
      case 'SYSTEM':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-96 glass-effect rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-quoc-neon hover:text-quoc-neon-dark transition-colors"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quoc-neon mx-auto"></div>
                    <p className="mt-2">Đang tải...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p>Không có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-white/5' : ''
                      }`}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`text-2xl ${getNotificationColor(notif.type)}`}>
                          {getNotificationIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-quoc-neon rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 text-center">
                  <a
                    href="/notifications"
                    className="text-sm text-quoc-neon hover:text-quoc-neon-dark transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Xem tất cả thông báo →
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
