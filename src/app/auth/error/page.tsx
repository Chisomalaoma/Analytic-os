'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Home } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support or try again later.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
    },
    Verification: {
      title: 'Verification Error',
      description: 'The verification token has expired or has already been used.',
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'Error occurred during OAuth sign in process.',
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error occurred during OAuth callback.',
    },
    OAuthCreateAccount: {
      title: 'OAuth Account Creation Error',
      description: 'Could not create OAuth account.',
    },
    EmailCreateAccount: {
      title: 'Email Account Creation Error',
      description: 'Could not create email account.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error occurred during callback.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Not Linked',
      description: 'This email is already associated with another account. Please sign in using your original method.',
    },
    EmailSignin: {
      title: 'Email Sign In Error',
      description: 'Check your email address.',
    },
    CredentialsSignin: {
      title: 'Sign In Error',
      description: 'Invalid email or password. Please try again.',
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'Please sign in to access this page.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.',
    },
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#23262F] rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-semibold text-white mb-3">
            {errorInfo.title}
          </h1>

          {/* Error Description */}
          <p className="text-gray-400 mb-8">
            {errorInfo.description}
          </p>

          {/* Error Code */}
          {error && (
            <div className="mb-8 p-3 bg-[#0A0A0A] border border-[#23262F] rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Error Code</p>
              <p className="text-sm text-gray-300 font-mono">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 bg-[#23262F] hover:bg-[#2A2F3A] text-white font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-6 pt-6 border-t border-[#23262F]">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a href="mailto:support@wtxonline.com" className="text-[#4459FF] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
