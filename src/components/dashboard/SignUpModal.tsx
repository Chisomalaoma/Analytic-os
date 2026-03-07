'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { X, Eye, EyeOff, Check } from 'lucide-react'

interface SignUpModalProps {
  open: boolean
  onClose: () => void
  onSwitchToSignin?: () => void
}

export default function SignUpModal({ open, onClose, onSwitchToSignin }: SignUpModalProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [bvn, setBvn] = useState('')
  const [nin, setNin] = useState('')
  const [otp, setOtp] = useState('')
  const [role, setRole] = useState<'INVESTOR' | 'ADMIN'>('INVESTOR')
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [comingSoonProvider, setComingSoonProvider] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!open) return null

  // List of public email domains to block for business accounts
  const publicEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
    'gmx.com', 'inbox.com', 'live.com', 'msn.com', 'yahoo.co.uk',
    'googlemail.com', 'me.com', 'mac.com'
  ];

  // Function to validate business email
  const isValidBusinessEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !publicEmailDomains.includes(domain);
  };

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol

  const handleComingSoon = (provider: string) => {
    setComingSoonProvider(provider)
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate business email for ADMIN role
    if (role === 'ADMIN' && !isValidBusinessEmail(workEmail)) {
      setError('Please use a work or office email address. Public email domains (Gmail, Yahoo, Hotmail, etc.) are not allowed for business accounts.')
      setLoading(false)
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    try {
      // Step 1: Create account
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: role === 'ADMIN' ? companyName : firstName,
          lastName: role === 'ADMIN' ? 'Business' : lastName,
          companyName: role === 'ADMIN' ? companyName : undefined, // Send companyName for business accounts
          username,
          phone,
          email: role === 'ADMIN' ? workEmail : email,
          password,
          bvn: bvn || undefined,
          nin: nin || undefined,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Step 2: Move to OTP verification step
      setStep('otp')
      setLoading(false)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: role === 'ADMIN' ? workEmail : email, token: otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid verification code')
        setLoading(false)
        return
      }

      // Email verified - sign in and close
      await signIn('credentials', {
        email: role === 'ADMIN' ? workEmail : email,
        password,
        redirect: false,
      })
      await updateSession()
      onClose()
      // Use setTimeout to allow session to update
      setTimeout(() => {
        // All users go to the main dashboard, regardless of role
        router.push('/dashboard')
        router.refresh()
      }, 100)
    } catch (err) {
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
        body: JSON.stringify({ email: role === 'ADMIN' ? workEmail : email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend code')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('form')
    setFirstName('')
    setLastName('')
    setCompanyName('')
    setWorkEmail('')
    setUsername('')
    setPhone('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOtp('')
    setRole('INVESTOR')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#0D0D0D] border border-[#23262F] rounded-2xl shadow-2xl animate-scaleIn overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23262F]">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {step === 'form' ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {step === 'form'
                ? 'Fill in your details to get started'
                : `Enter the code sent to ${email}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#23262F] scrollbar-track-transparent pb-24">
          {/* Social Sign Up Buttons */}
          <div className="space-y-3 mb-6">
            <p className="text-center text-gray-400 text-sm">Sign up faster with</p>

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
              Continue with Google
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#23262F] border border-[#23262F] rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            {/* Twitter/X */}
            <button
              type="button"
              onClick={() => {
                console.log('🐦 [SIGNUP-MODAL] Twitter/X button clicked - initiating OAuth...')
                signIn('twitter', { callbackUrl: '/dashboard' })
              }}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#23262F] border border-[#23262F] rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Continue with X
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#23262F]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0D0D0D] text-gray-500">or sign up with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {showComingSoon && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm animate-fadeIn">
              🚀 {comingSoonProvider} sign-in coming soon!
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection - Moved to Top */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('INVESTOR')}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      role === 'INVESTOR'
                        ? 'bg-[#4459FF]/10 border-[#4459FF] text-white'
                        : 'bg-[#1A1A1A] border-[#23262F] text-gray-400 hover:border-[#4459FF]'
                    }`}
                  >
                    <div className="font-medium">Personal</div>
                    <div className="text-xs mt-1 opacity-70">I am a retail investor</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      role === 'ADMIN'
                        ? 'bg-[#4459FF]/10 border-[#4459FF] text-white'
                        : 'bg-[#1A1A1A] border-[#23262F] text-gray-400 hover:border-[#4459FF]'
                    }`}
                  >
                    <div className="font-medium">Business</div>
                    <div className="text-xs mt-1 opacity-70">Access fundraising features</div>
                  </button>
                </div>
              </div>

              {/* Conditional Fields Based on Account Type */}
              {role === 'INVESTOR' ? (
                <>
                  {/* Personal Account Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

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
                </>
              ) : (
                <>
                  {/* Business Account Fields */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Work Email</label>
                    <input
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className={`w-full bg-[#1A1A1A] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                        workEmail && !isValidBusinessEmail(workEmail)
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#23262F] focus:border-[#4459FF]'
                      }`}
                      placeholder="Enter work email"
                      required
                    />
                    {workEmail && !isValidBusinessEmail(workEmail) && (
                      <p className="text-red-500 text-xs mt-1">
                        Please use a work or office email. Public email domains (Gmail, Yahoo, etc.) are not allowed.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 13) {
                      setPhone(value)
                    }
                  }}
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4459FF]"
                  placeholder="+234 80 0000 0000"
                  maxLength={13}
                />
              </div>

              {/* BVN or NIN - Required for wallet */}
              <div className="bg-[#1A1A1A] border border-[#23262F] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">
                  <span className="text-white font-medium">Wallet Verification</span> - Provide either BVN or NIN (required by CBN for wallet creation)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BVN (Optional)</label>
                    <input
                      type="text"
                      value={bvn}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 11) {
                          setBvn(value)
                        }
                      }}
                      className="w-full bg-[#0D0D0D] border border-[#23262F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4459FF]"
                      placeholder="11 digits"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">NIN (Optional)</label>
                    <input
                      type="text"
                      value={nin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 11) {
                          setNin(value)
                        }
                      }}
                      className="w-full bg-[#0D0D0D] border border-[#23262F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4459FF]"
                      placeholder="11 digits"
                      maxLength={11}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can add this later in settings, but wallet features will be disabled until provided.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-[#4459FF]"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
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
              )}

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">Enter the 6-digit code sent to</p>
                <p className="text-white font-medium">{role === 'ADMIN' ? workEmail : email}</p>
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
                {loading ? 'Verifying...' : 'Verify Email'}
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0D0D0D] border-t border-[#23262F] text-center text-sm text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToSignin}
            className="text-[#4459FF] hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
