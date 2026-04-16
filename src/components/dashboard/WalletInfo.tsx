// src/components/dashboard/WalletInfo.tsx

'use client'

import { useState, useCallback } from 'react'
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
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/wallet/sync-transactions', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`Synced ${data.synced} new transactions!`)
        window.location.reload()
      } else {
        alert(data.error || 'Failed to sync')
      }
    } catch (error) {
      alert('Failed to sync transactions')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-[#23262F] rounded-xl px-4 py-2">
      {/* Balance */}
      <div className="text-right">
        <p className="text-xs text-gray-400">Wallet Balance</p>
        <p className="text-sm font-semibold text-white">{formatAmount(balance / 100)}</p>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#858B9A33]" />

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
        title="Sync pending transactions"
      >
        <svg className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {syncing ? 'Syncing...' : 'Sync'}
      </button>

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
