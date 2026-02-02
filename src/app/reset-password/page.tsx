'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ResetPasswordModal from '@/components/dashboard/ResetPasswordModal'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tokenParam = searchParams.get('token')

    if (emailParam && tokenParam) {
      setEmail(decodeURIComponent(emailParam))
      setToken(tokenParam)
      setIsReady(true)
    }
  }, [searchParams])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ResetPasswordModal
        open={true}
        onClose={() => window.location.href = '/'}
        email={email}
        resetToken={token}
      />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
