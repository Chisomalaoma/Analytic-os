// src/components/dashboard/FundWalletModal.tsx

'use client'

import { useState, useCallback } from 'react'
import { formatAccountNumber } from '@/lib/utils/wallet'

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
  accountNumber: string
  bankName: string
  accountName: string
}

export function FundWalletModal({
  open,
  onClose,
  accountNumber,
  bankName,
  accountName
}: FundWalletModalProps) {
  const [copied, setCopied] = useState<'account' | 'name' | null>(null)

  const copyToClipboard = useCallback(async (text: string, type: 'account' | 'name') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const shareDetails = useCallback(() => {
    const text = `Bank: ${bankName}\nAccount: ${accountNumber}\nName: ${accountName}`
    if (navigator.share) {
      navigator.share({ title: 'Wallet Details', text })
    } else {
      navigator.clipboard.writeText(text)
      setCopied('account')
      setTimeout(() => setCopied(null), 2000)
    }
  }, [bankName, accountNumber, accountName])

  if (!open) return null

  const hasAccountDetails = accountNumber && accountNumber !== ''

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#23262F] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23262F] p-4 border-b border-[#353A45] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Fund Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#181A20] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-4">
            Transfer to this account and your wallet will be credited automatically
          </p>

        {/* Bank Details Card */}
        <div className="bg-[#181A20] rounded-xl p-3 space-y-3">
          {/* Bank Name */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Bank</span>
            <span className="text-xs text-white font-medium">{bankName}</span>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-mono">{formatAccountNumber(accountNumber)}</span>
              <button
                onClick={() => copyToClipboard(accountNumber, 'account')}
                className="p-1 hover:bg-[#23262F] rounded transition-colors"
              >
                {copied === 'account' ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Account Name</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-medium truncate max-w-[180px]">{accountName}</span>
              <button
                onClick={() => copyToClipboard(accountName, 'name')}
                className="p-1 hover:bg-[#23262F] rounded transition-colors flex-shrink-0"
              >
                {copied === 'name' ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={shareDetails}
          className="w-full mt-3 py-2.5 bg-[#181A20] hover:bg-[#2A2F3A] text-gray-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share Details
        </button>

        {/* Instructions */}
        <div className="mt-3 p-3 bg-[#181A20] rounded-xl">
          <p className="text-xs text-gray-400">
            <span className="text-yellow-400 font-medium">Note:</span> Your wallet will be credited
            automatically once the transfer is confirmed. This usually takes a few seconds.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
