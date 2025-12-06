'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError('')
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-quoc-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-quoc-neon/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-effect p-8 rounded-2xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">
            QUOC<span className="text-quoc-neon">BANK</span>
          </h1>
          <p className="text-gray-400">Truy cập két sắt số của bạn</p>
        </div>

        <form action={onSubmit} className="space-y-5">
          <div className="group">
            <label className="text-sm text-gray-300 block mb-1 group-focus-within:text-quoc-neon transition-colors">Tài khoản</label>
            <input name="username" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-quoc-neon outline-none transition-colors" />
          </div>

          <div className="group">
            <label className="text-sm text-gray-300 block mb-1 group-focus-within:text-quoc-neon transition-colors">Mật khẩu</label>
            <input type="password" name="password" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-quoc-neon outline-none transition-colors" />
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}

          <button disabled={isLoading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-quoc-neon transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]">
            {isLoading ? 'Đang xác thực...' : 'Truy cập hệ thống'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400 text-sm">
          Chưa có tài khoản? <Link href="/register" className="text-quoc-neon hover:underline font-semibold">Mở thẻ ngay</Link>
        </p>
      </motion.div>
    </div>
  )
}