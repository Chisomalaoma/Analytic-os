'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface MobileExploreMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileExploreMenu({ isOpen, onClose }: MobileExploreMenuProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (!isOpen) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-x-0 top-0 z-[101] bg-[#0A0A0A] rounded-b-2xl shadow-2xl animate-slideDown max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-white font-bold">EXPLORE</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#1A1A1A] text-white placeholder-gray-500 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-[#4459FF]"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* User Info */}
        {status === 'authenticated' && session?.user && (
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {session.user.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  {session.user.name || 'User'}
                </div>
                <div className="text-gray-500 text-xs">
                  {session.user.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors"
          >
            <span className="text-xl">⭐</span>
            <span className="text-white text-sm font-medium">Watchlist</span>
          </button>

          <button
            onClick={() => handleNavigation('/dashboard/portfolio')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors"
          >
            <span className="text-xl">💼</span>
            <span className="text-white text-sm font-medium">Portfolio</span>
          </button>

          <button
            onClick={() => handleNavigation('/dashboard/list-startup')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors"
          >
            <span className="text-xl">🚀</span>
            <span className="text-white text-sm font-medium">List Startup</span>
          </button>

          {status === 'authenticated' && (
            <>
              <button
                onClick={() => handleNavigation('/dashboard/account')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="text-white text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors text-red-500"
              >
                <span className="text-xl">🚪</span>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </>
          )}
        </div>

        {/* Bottom Links */}
        <div className="px-4 py-4 border-t border-[#1A1A1A] flex items-center justify-center gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}
