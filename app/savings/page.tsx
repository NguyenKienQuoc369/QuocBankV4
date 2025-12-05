import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getSavingsAccounts, getTotalSavingsBalance } from '@/actions/savings'
import { getAccount } from '@/actions/banking'
import { SavingsClient } from './savings-client'

export default async function SavingsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const [account, savingsAccounts, totalSavings] = await Promise.all([
    getAccount(),
    getSavingsAccounts(),
    getTotalSavingsBalance(),
  ])

  if (!account) {
    redirect('/login')
  }

  return (
    <SavingsClient
      user={session}
      account={account}
      savingsAccounts={savingsAccounts}
      totalSavings={totalSavings}
    />
  )
}
