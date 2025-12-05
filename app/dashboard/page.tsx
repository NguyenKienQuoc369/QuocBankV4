import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getAccount, getTransactionHistory } from '@/actions/banking'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const account = await getAccount()
  const transactions = await getTransactionHistory(10)

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quoc-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Không tìm thấy tài khoản
          </h1>
          <p className="text-gray-400">
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardClient
      user={session}
      account={account}
      transactions={transactions}
    />
  )
}
