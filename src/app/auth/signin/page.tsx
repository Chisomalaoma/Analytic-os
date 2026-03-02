'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page where the sign-in modal can be opened
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}
