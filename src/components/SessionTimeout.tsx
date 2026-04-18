'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const TIMEOUT_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds
const WARNING_DURATION = 9 * 60 * 1000 // 9 minutes - show warning 1 minute before timeout

export default function SessionTimeout() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(60)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const handleLogout = useCallback(async () => {
    clearAllTimers()
    setShowWarning(false)
    await signOut({ redirect: false })
    router.push('/')
  }, [clearAllTimers, router])

  const startCountdown = useCallback(() => {
    setRemainingSeconds(60)
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const resetTimer = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)

    // Set warning timer (9 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true)
      startCountdown()
    }, WARNING_DURATION)

    // Set logout timer (10 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, TIMEOUT_DURATION)
  }, [clearAllTimers, handleLogout, startCountdown])

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false)
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    // Only run if user is logged in
    if (!session?.user) {
      clearAllTimers()
      return
    }

    // Start the timer
    resetTimer()

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Reset timer on any user activity
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      clearAllTimers()
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [session, resetTimer, clearAllTimers, showWarning])

  // Don't render anything if user is not logged in
  if (!session?.user) return null

  // Warning modal
  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] rounded-xl shadow-2xl w-[95%] max-w-md mx-4 p-6 border border-[#262626] animate-scaleIn">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Session Timeout Warning
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            You've been inactive for a while. For your security, you'll be logged out in:
          </p>
          <div className="text-4xl font-bold text-yellow-500 mb-2">
            {remainingSeconds}s
          </div>
          <p className="text-gray-500 text-xs">
            Click "Stay Logged In" to continue your session
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 py-3 bg-[#23262F] hover:bg-[#2d3139] text-white rounded-lg transition-colors font-medium"
          >
            Log Out Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg transition-colors font-medium"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  )
}
