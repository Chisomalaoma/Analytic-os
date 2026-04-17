// src/components/dashboard/WalletInfo.tsx

'use client'

import { useCurrency } from '@/contexts/CurrencyContext';

interface WalletInfoProps {
  balance: number // in kobo
  accountNumber: string
  bankName: string
  accountName: string
  onOpenFund: () => void
  onOpenWithdraw?: () => void
}

export function WalletInfo({
  balance,
  accountNumber,
  bankName,
  accountName,
  onOpenFund,
  onOpenWithdraw
}: WalletInfoProps) {
  const { formatAmount } = useCurrency()

  return (
    <div className="flex items-center gap-3 bg-[#23262F] rounded-xl px-4 py-2">
      {/* Balance */}
      <div className="text-right">
        <p className="text-xs text-gray-400">Wallet Balance</p>
        <p className="text-sm font-semibold text-white">{formatAmount(balance / 100)}</p>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#858B9A33]" />

      {/* Fund Button */}
      <button
        onClick={onOpenFund}
        className="px-3 py-1.5 bg-[#4459FF] hover:bg-[#3448EE] text-white text-xs font-medium rounded-lg transition-colors"
      >
        Fund +
      </button>

      {/* Withdraw Button */}
      {onOpenWithdraw && (
        <button
          onClick={onOpenWithdraw}
          className="px-3 py-1.5 bg-[#4459FF] hover:bg-[#3448EE] text-white text-xs font-medium rounded-lg transition-colors"
        >
          Withdraw -
        </button>
      )}
    </div>
  )
}
