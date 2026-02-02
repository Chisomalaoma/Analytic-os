'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'
import ForgotPasswordModal from './ForgotPasswordModal'

interface SignInModalProps {
  open: boolean
  onClose: () => void
  onSwitchToSignup?: () => void
}

export default function SignInModal({ open, onClose, onSwitchToSignup }: SignInModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [comingSoonProvider, setComingSoonProvider] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  if (!open) return null

  const handleComingSoon = (provider: string) => {
    setComingSoonProvider(provider)
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 2000)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Verify credentials (but don't sign in yet)
      const verifyRes = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(verifyData.error || 'Invalid email or password')
        setLoading(false)
        return
      }

      // Step 2: Send OTP
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const otpData = await otpRes.json()

      if (!otpRes.ok) {
        setError(otpData.error || 'Failed to send verification code')
        setLoading(false)
        return
      }

      // Move to OTP step
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
      // Verify OTP
      const res = await fetch('/api/auth/verify-otp', {
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

      // OTP verified - now sign in
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInRes?.error) {
        setError('Sign in failed')
        setLoading(false)
        return
      }

      onClose()
      // Allow session to update, then redirect based on role
      setTimeout(() => {
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }, 100)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-otp', {
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
    setStep('form')
    setEmail('')
    setPassword('')
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
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          onClick={handleClose}
        >
          &times;
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {step === 'form' ? 'Welcome Back' : 'Verify Your Identity'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {step === 'form'
              ? 'Sign in to access your dashboard'
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Coming Soon message */}
        {showComingSoon && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm animate-fadeIn">
            🚀 {comingSoonProvider} sign-in coming soon!
          </div>
        )}

        {/* Social Sign In Buttons */}
        {step === 'form' && (
          <div className="space-y-3 mb-6">
            <p className="text-center text-gray-400 text-sm">Continue with</p>

            {/* Google */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#23262F] border border-[#23262F] rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleComingSoon('Facebook')}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#23262F] border border-[#23262F] rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            {/* Twitter/X */}
            <button
              type="button"
              onClick={() => handleComingSoon('Twitter/X')}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#23262F] border border-[#23262F] rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
          </div>
        )}

        {/* Divider */}
        {step === 'form' && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#23262F]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0A0A0A] text-gray-500">or sign in with email</span>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        {step === 'form' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-[#4459FF]"
                  placeholder="Enter your password"
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
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#4459FF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : (
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
              {loading ? 'Verifying...' : 'Sign In'}
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

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-[#4459FF] hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToSignIn={() => {
          setShowForgotPassword(false)
        }}
      />
    </div>
  )
}
