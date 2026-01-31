'use client'

import { useEffect, useState } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useSession } from 'next-auth/react'
import { FundWalletModal } from './FundWalletModal'
import { WithdrawModal } from './WithdrawModal'

export function MobileStatsBar() {
  const [wallet, setWallet] = useState<any>(null)
  const [showFundModal, setShowFundModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { formatAmount } = useCurrency()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchWallet = async () => {
      if (!session?.user?.id) return
      
      try {
        const res = await fetch('/api/wallet')
        const data = await res.json()
        console.log('Mobile wallet data:', data)
        if (data.success && data.wallet) {
          console.log('Setting wallet:', data.wallet)
          setWallet(data.wallet)
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      }
    }
    fetchWallet()
  }, [session])

  const balance = wallet?.ngnBalance || 0

  const handleWithdrawSuccess = () => {
    // Refresh wallet balance after withdrawal
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/wallet')
        const data = await res.json()
        if (data.success && data.wallet) {
          setWallet(data.wallet)
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      }
    }
    fetchWallet()
  }

  return (
    <div className="sticky top-[57px] z-30 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Wallet Balance */}
        <div>
          <div className="text-xs text-gray-500 mb-1">WALLET BALANCE</div>
          <div className="text-lg font-bold text-white">{formatAmount(balance / 100)}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFundModal(true)}
            className="px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Fund
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-white text-sm font-medium rounded-lg transition-colors border border-[#23262F]"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        open={showFundModal}
        onClose={() => setShowFundModal(false)}
        accountNumber={wallet?.accountNumber || ''}
        bankName={wallet?.bankName || 'Monnify'}
        accountName={wallet?.accountName || session?.user?.name || 'Your Account'}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
        onWithdraw={handleWithdrawSuccess}
      />
    </div>
  )
}
