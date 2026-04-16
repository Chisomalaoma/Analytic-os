'use client'

import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

interface KYCBannerProps {
  onStartKYC: () => void
}

export function KYCBanner({ onStartKYC }: KYCBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Complete your verification to unlock full wallet functionality.
          </p>
          <button
            onClick={onStartKYC}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Start Verification
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
