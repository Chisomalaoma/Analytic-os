'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onBackToSignIn?: () => void
}

export default function ForgotPasswordModal({ open, onClose, onBackToSignIn }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  if (!open) return null

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send reset code')
        setLoading(false)
        return
      }

      setStep('otp')
      setLoading(false)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid verification code')
        setLoading(false)
        return
      }

      // OTP verified - show success and redirect to reset password
      setStep('success')
      setLoading(false)
      
      // Auto close and redirect after 2 seconds
      setTimeout(() => {
        handleClose()
        // Open reset password modal with token
        window.location.href = `/reset-password?token=${data.resetToken}&email=${encodeURIComponent(email)}`
      }, 2000)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setOtp('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] rounded-xl shadow-2xl w-[95%] max-w-md mx-4 p-6 relative animate-scaleIn">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Verify Your Identity'}
            {step === 'success' && 'Success!'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && `Enter the code sent to ${email}`}
            {step === 'success' && 'Redirecting to reset password...'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400">Enter the 6-digit code sent to</p>
              <p className="text-white font-medium">{email}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-[#4459FF]"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Did not receive the code? Resend
            </button>
          </form>
        )}

        {/* Success Message */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Verification successful!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to reset password...</p>
          </div>
        )}

        {/* Footer */}
        {step === 'email' && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Remember your password?{' '}
            <button
              onClick={onBackToSignIn}
              className="text-[#4459FF] hover:underline"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
