'use client'

import { motion } from 'framer-motion'
import type { BillProviderInfo } from '@/actions/bills'

interface BillProviderCardProps {
  provider: BillProviderInfo
  onSelect: (provider: BillProviderInfo) => void
}

export function BillProviderCard({ provider, onSelect }: BillProviderCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ELECTRIC':
        return '⚡'
      case 'WATER':
        return '💧'
      case 'INTERNET':
        return '🌐'
      case 'PHONE':
        return '📱'
      case 'TV':
        return '📺'
      default:
        return '📄'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ELECTRIC':
        return 'Điện'
      case 'WATER':
        return 'Nước'
      case 'INTERNET':
        return 'Internet'
      case 'PHONE':
        return 'Điện thoại'
      case 'TV':
        return 'Truyền hình'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ELECTRIC':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 'WATER':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'INTERNET':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
      case 'PHONE':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'TV':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30'
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(provider)}
      className={`w-full p-6 rounded-2xl border-2 bg-gradient-to-br ${getCategoryColor(
        provider.category
      )} hover:shadow-lg transition-all text-left`}
    >
      {/* Icon & Category */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{getCategoryIcon(provider.category)}</div>
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white">
          {getCategoryName(provider.category)}
        </span>
      </div>

      {/* Provider Name */}
      <h3 className="text-lg font-bold text-white mb-2">{provider.name}</h3>

      {/* Description */}
      {provider.description && (
        <p className="text-sm text-gray-300 line-clamp-2">{provider.description}</p>
      )}

      {/* Action Hint */}
      <div className="mt-4 flex items-center gap-2 text-sm text-quoc-neon">
        <span>Thanh toán ngay</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </motion.button>
  )
}
