'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface KYCStatusData {
  status: 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired'
  verifiedAt: string | null
  idType: string | null
  rejectionReason: string | null
  addressVerified: boolean
  canWithdraw: boolean
}

interface KYCStatusBannerProps {
  onStartKYC: () => void
}

export function KYCStatusBanner({ onStartKYC }: KYCStatusBannerProps) {
  const [kycData, setKycData] = useState<KYCStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    try {
      const res = await fetch('/api/kyc/status')
      const data = await res.json()
      setKycData(data)
    } catch (error) {
      console.error('Failed to fetch KYC status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#151517] border border-[#262626] rounded-lg p-4 mb-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    )
  }

  if (!kycData) return null

  // Don't show banner if already verified
  if (kycData.status === 'verified') return null

  // Pending - User hasn't started KYC
  if (kycData.status === 'pending') {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Complete Your KYC Verification</h3>
            <p className="text-gray-300 text-sm mb-3">
              Verify your identity to unlock withdrawals and full platform features.
            </p>
            <button
              onClick={onStartKYC}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Verification
            </button>
          </div>
        </div>
      </div>
    )
  }

  // In Progress - KYC submitted, awaiting approval
  if (kycData.status === 'in_progress') {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">KYC Verification Pending</h3>
            <p className="text-gray-300 text-sm">
              Your verification is being reviewed. This usually takes 24-48 hours. You'll be notified once it's complete.
            </p>
            {kycData.idType && (
              <p className="text-gray-400 text-xs mt-2">
                ID Type: {kycData.idType}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Rejected - KYC was rejected
  if (kycData.status === 'rejected') {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">KYC Verification Failed</h3>
            <p className="text-gray-300 text-sm mb-2">
              Your verification was not approved. Please review the reason below and try again.
            </p>
            {kycData.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-3">
                <p className="text-red-400 text-sm font-medium">Reason:</p>
                <p className="text-red-300 text-sm mt-1">{kycData.rejectionReason}</p>
              </div>
            )}
            <button
              onClick={onStartKYC}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Expired - KYC has expired
  if (kycData.status === 'expired') {
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">KYC Verification Expired</h3>
            <p className="text-gray-300 text-sm mb-3">
              Your verification has expired. Please complete the verification process again.
            </p>
            <button
              onClick={onStartKYC}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Renew Verification
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
