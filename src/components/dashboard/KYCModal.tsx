'use client'

import { useState } from 'react'

interface KYCModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function KYCModal({ open, onClose, onSuccess }: KYCModalProps) {
  const [bvn, setBvn] = useState('')
  const [nin, setNin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bvn && !nin) {
      setError('Please provide either BVN or NIN')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Update user profile with BVN/NIN
      const res = await fetch('/api/user/update-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, nin })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update KYC')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-md border border-[#262626]">
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <h2 className="text-xl font-semibold text-white">Complete KYC</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-400">
            To create your wallet, please provide either your BVN or NIN for verification.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              BVN (Bank Verification Number)
            </label>
            <input
              type="text"
              value={bvn}
              onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="Enter 11-digit BVN"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
              maxLength={11}
            />
          </div>

          <div className="text-center text-sm text-gray-500">OR</div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              NIN (National Identification Number)
            </label>
            <input
              type="text"
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="Enter 11-digit NIN"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#4459FF]"
              maxLength={11}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!bvn && !nin)}
            className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {loading ? 'Submitting...' : 'Submit & Create Wallet'}
          </button>
        </form>
      </div>
    </div>
  )
}
