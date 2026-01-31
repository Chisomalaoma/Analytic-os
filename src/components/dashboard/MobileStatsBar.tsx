'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FundWalletModal } from './FundWalletModal'
import { WithdrawModal } from './WithdrawModal'
import { useWallet } from '@/hooks/useWallet'
import { useWalletSync } from '@/hooks/useWalletSync'

export function MobileStatsBar() {
  const [showFundModal, setShowFundModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { formatAmount } = useCurrency()
  const { data: session, status } = useSession()

  // Use the EXACT same wallet hook as desktop
  const { balance, wallet, hasWallet, isLoading } = useWallet()

  // Enable auto-sync for wallet polling - SAME AS DESKTOP
  useWalletSync(status === 'authenticated')

  return (
    <div className="sticky top-[57px] z-30 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Wallet Balance */}
        <div>
          <div className="text-xs text-gray-500 mb-1">WALLET BALANCE</div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 bg-[#1A1A1A] rounded animate-pulse" />
            </div>
          ) : (
            <div className="text-lg font-bold text-white">{formatAmount(balance / 100)}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFundModal(true)}
            disabled={isLoading || !hasWallet}
            className="px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Fund
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={isLoading || !hasWallet}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] disabled:bg-[#1A1A1A]/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-[#23262F]"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Fund Wallet Modal - SAME AS DESKTOP */}
      {showFundModal && wallet && (
        <FundWalletModal
          open={showFundModal}
          onClose={() => setShowFundModal(false)}
          accountNumber={wallet.accountNumber}
          bankName={wallet.bankName}
          accountName={wallet.accountName}
        />
      )}

      {/* Withdraw Modal - SAME AS DESKTOP */}
      {showWithdrawModal && wallet && (
        <WithdrawModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          balance={balance}
          onWithdraw={() => {
            setShowWithdrawModal(false)
          }}
        />
      )}
    </div>
  )
}
