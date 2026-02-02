'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, X, Check } from 'lucide-react'

interface ResetPasswordModalProps {
  open: boolean
  onClose: () => void
  email: string
  resetToken: string
}

export default function ResetPasswordModal({ open, onClose, email, resetToken }: ResetPasswordModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!open) return null

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: resetToken,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        onClose()
        router.push('/')
      }, 2000)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-scaleIn">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Create New Password</h2>
              <p className="text-gray-400 text-sm mt-1">
                Enter a strong password for your account
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-[#4459FF]"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-[#4459FF]"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-[#1A1A1A] border border-[#23262F] rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-400 mb-2">Password must contain:</p>
                <div className="space-y-1.5">
                  <div className={`flex items-center gap-2 text-sm ${hasMinLength ? 'text-green-500' : 'text-gray-500'}`}>
                    <Check className={`w-4 h-4 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${hasUpperCase ? 'text-green-500' : 'text-gray-500'}`}>
                    <Check className={`w-4 h-4 ${hasUpperCase ? 'opacity-100' : 'opacity-30'}`} />
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${hasLowerCase ? 'text-green-500' : 'text-gray-500'}`}>
                    <Check className={`w-4 h-4 ${hasLowerCase ? 'opacity-100' : 'opacity-30'}`} />
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${hasNumber ? 'text-green-500' : 'text-gray-500'}`}>
                    <Check className={`w-4 h-4 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${hasSymbol ? 'text-green-500' : 'text-gray-500'}`}>
                    <Check className={`w-4 h-4 ${hasSymbol ? 'opacity-100' : 'opacity-30'}`} />
                    <span>One symbol (!@#$%^&*...)</span>
                  </div>
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-500' : 'text-gray-500'}`}>
                      <Check className={`w-4 h-4 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Password Reset Successful!</h3>
            <p className="text-gray-400 text-sm">Redirecting to sign in...</p>
          </div>
        )}
      </div>
    </div>
  )
}
