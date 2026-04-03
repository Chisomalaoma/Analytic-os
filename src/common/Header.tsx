'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import SignInModal from '@/components/dashboard/SignInModal'
import SignUpModal from '@/components/dashboard/SignUpModal'
import { WalletInfo } from '@/components/dashboard/WalletInfo'
import { FundWalletModal } from '@/components/dashboard/FundWalletModal'
import { WithdrawModal } from '@/components/dashboard/WithdrawModal'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { useWallet } from '@/hooks/useWallet'
import { useWalletSync } from '@/hooks/useWalletSync'
import { KYCModal } from '@/components/dashboard/KYCModal'
import { useToken } from '@/contexts/TokenContext'

interface HeaderProps {
  onOpenSidebar?: () => void
}

export default function Header({ 
  onOpenSidebar
}: HeaderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)

  // Get token data from context
  const { tokenSymbol, tokenPrice, tokenChange, tokenPercentChange, annualYield, isInWatchlist, toggleWatchlist } = useToken()

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (tokenSymbol) return tokenSymbol
    if (pathname?.includes('/portfolio')) return 'Portfolio'
    if (pathname?.includes('/account')) return 'Account'
    return 'Dashboard'
  }

  // Use NGN wallet hook
  const { balance, wallet, hasWallet, isLoading, createWallet, mutateWallet } = useWallet()
  const [isCreating, setIsCreating] = useState(false)
  const [walletCreationAttempted, setWalletCreationAttempted] = useState(false)

  // Enable auto-sync for wallet polling
  useWalletSync(status === 'authenticated')

  // Automatically create wallet if user doesn't have one
  useEffect(() => {
    if (status === 'authenticated' && !isLoading && !hasWallet && !walletCreationAttempted) {
      setWalletCreationAttempted(true)
      handleCreateWallet()
    }
  }, [status, isLoading, hasWallet, walletCreationAttempted])

  // Close profile menu when clicking outside
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
      setShowProfileMenu(false)
    }
  }, [])

  useEffect(() => {
    if (showProfileMenu) {
      window.addEventListener('click', handleClickOutside)
    }
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [showProfileMenu, handleClickOutside])

  const handleLogout = useCallback(async () => {
    setShowProfileMenu(false)
    await signOut({ callbackUrl: '/' })
  }, [])

  const handleCreateWallet = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      console.log('[HEADER] Creating wallet automatically...')
      await createWallet()
      await mutateWallet()
      console.log('[HEADER] Wallet created successfully')
    } catch (error: any) {
      console.error('[HEADER] Failed to create wallet:', error)
      console.error('[HEADER] Error details:', error.message)
      
      // Check if error is due to missing BVN/NIN
      if (error.message?.includes('BVN or NIN')) {
        setShowKYCModal(true)
      } else {
        alert(`Failed to create wallet: ${error.message || 'Unknown error'}. Please try again or contact support.`)
      }
    } finally {
      setIsCreating(false)
    }
  }, [createWallet, mutateWallet, isCreating])

  const handleKYCSuccess = useCallback(async () => {
    setShowKYCModal(false)
    // Retry wallet creation after KYC update
    await handleCreateWallet()
  }, [handleCreateWallet])

  return (
    <>
      <header className="bg-[#181A20] p-4 border-b border-[#858B9A33] flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden p-2 hover:bg-[#23262F] rounded-lg transition-colors"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Title with optional price and watchlist */}
          <div className="flex items-center gap-4">
            {/* Watchlist Star - Only show if on token page */}
            {tokenSymbol && (
              <button 
                onClick={toggleWatchlist}
                className="p-2 rounded-xl border-2 border-gray-700 transition-colors flex-shrink-0 hover:border-gray-600"
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isInWatchlist ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            )}
            
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getPageTitle()}
            </h1>
            
            {/* Annual Yield - Only show if on token page */}
            {tokenSymbol && annualYield !== null && (
              <div className="flex flex-col items-start">
                <div className="text-lg font-bold text-[#C8FF00]">
                  {annualYield}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <NotificationBell />

          {/* Wallet Info - Authenticated User */}
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-2">
              {isLoading || isCreating ? (
                /* Loading State */
                <div className="flex items-center gap-3 bg-[#23262F] rounded-xl px-4 py-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Wallet Balance</p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-[#858B9A33]" />
                  <div className="text-xs text-gray-400">
                    {isCreating ? 'Creating wallet...' : 'Loading...'}
                  </div>
                </div>
              ) : wallet ? (
                /* NGN Wallet */
                <WalletInfo
                  balance={balance}
                  accountNumber={wallet.accountNumber}
                  bankName={wallet.bankName}
                  accountName={wallet.accountName}
                  onOpenFund={() => setShowFundModal(true)}
                  onOpenWithdraw={() => setShowWithdrawModal(true)}
                />
              ) : (
                /* No Wallet - Show Create Button */
                <button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#4459FF]/50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  {isCreating && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfileMenu(!showProfileMenu)
                  }}
                  className="p-2 hover:bg-[#23262F] rounded-lg transition-colors"
                  aria-label="Profile menu"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#23262F] rounded-lg shadow-xl border border-[#858B9A33] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#858B9A33]">
                      <p className="text-sm text-gray-400">Account</p>
                      <p className="text-sm text-white truncate">{session.user.email || session.user.name}</p>
                    </div>
                    <a
                      href="/dashboard/account"
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#181A20] transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#181A20] transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : status === 'loading' ? (
            <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSignIn(true)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="px-4 py-2 text-sm bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignup={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignin={() => {
          setShowSignUp(false)
          setShowSignIn(true)
        }}
      />

      {/* Fund Wallet Modal */}
      {showFundModal && wallet && (
        <FundWalletModal
          open={showFundModal}
          onClose={() => setShowFundModal(false)}
          accountNumber={wallet.accountNumber}
          bankName={wallet.bankName}
          accountName={wallet.accountName}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && wallet && (
        <WithdrawModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          balance={balance}
          onWithdraw={() => {
            setShowWithdrawModal(false)
          }}
        />
      )}

      {/* KYC Modal */}
      <KYCModal
        open={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={handleKYCSuccess}
      />
    </>
  )
}
