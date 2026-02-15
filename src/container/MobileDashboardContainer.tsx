'use client'

import { useState, useEffect, useRef } from 'react'
import { MobileHeader } from '@/components/dashboard/MobileHeader'
import { MobileStatsBar } from '@/components/dashboard/MobileStatsBar'
import { MobileFilters } from '@/components/dashboard/MobileFilters'
import { MobileTokenRow } from '@/components/dashboard/MobileTokenRow'
import { MobileExploreMenu } from '@/components/dashboard/MobileExploreMenu'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import SearchDropdown from '@/components/dashboard/SearchDropdown'

interface Token {
  id: string
  symbol: string
  name: string
  price: number
  annualYield: number
  industry: string
  logoUrl: string | null
  volume: number
  listingDate: string
}

export default function MobileDashboardContainer() {
  const [showExplore, setShowExplore] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeTime, setActiveTime] = useState('1d')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        
        if (data.success && data.tokens) {
          // Sort by newest first
          const sorted = [...data.tokens].sort((a: Token, b: Token) => 
            new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
          )
          setTokens(sorted)
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSearch(false)
      }
    }
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showSearch])

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 safe-bottom">
      {/* Header */}
      <MobileHeader
        onOpenExplore={() => setShowExplore(true)}
        onOpenSearch={() => setShowSearch(true)}
      />

      {/* Stats Bar */}
      <MobileStatsBar />

      {/* Filters */}
      <MobileFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeTime={activeTime}
        onTimeChange={setActiveTime}
      />

      {/* Token List */}
      <div className="pb-4">
        {/* Table Header - Sticky outside scrollable area */}
        <div className="flex items-center px-4 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A] sticky top-[201px] z-20">
          <div className="flex-1 text-xs text-gray-500 font-medium uppercase tracking-wide">TOKEN</div>
          <div className="text-xs text-gray-500 font-medium text-right uppercase tracking-wide w-24">PRICE</div>
          <div className="text-xs text-gray-500 font-medium text-right uppercase tracking-wide w-20">VOLUME</div>
        </div>

        {/* Scrollable Container */}
        <div>
          {/* Loading State */}
          {loading && (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center px-4 py-3 border-b border-[#1A1A1A] animate-pulse">
                  <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 ml-2">
                    <div className="h-4 w-24 bg-[#1A1A1A] rounded mb-1" />
                    <div className="h-3 w-32 bg-[#1A1A1A] rounded" />
                  </div>
                  <div className="text-right w-24 flex-shrink-0">
                    <div className="h-4 w-16 bg-[#1A1A1A] rounded mb-1 ml-auto" />
                    <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                  </div>
                  <div className="text-right w-20 flex-shrink-0">
                    <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Token Rows */}
          {!loading && tokens.length > 0 && (
            <div>
              {tokens.map((token) => (
                <MobileTokenRow
                  key={token.id}
                  tokenId={token.id}
                  symbol={token.symbol}
                  name={token.name}
                  price={token.price / 100}
                  change={Math.random() * 20 - 10} // Placeholder - replace with real data
                  volume={token.volume / 100}
                  logo={token.logoUrl}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && tokens.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-white text-lg font-medium mb-2">No tokens found</div>
              <div className="text-gray-500 text-sm text-center">
                Check back later for new listings
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explore Menu */}
      <MobileExploreMenu
        isOpen={showExplore}
        onClose={() => setShowExplore(false)}
      />

      {/* Search Dropdown - Same as Desktop */}
      {showSearch && (
        <div ref={searchDropdownRef} className="fixed inset-x-0 top-[57px] z-[9999] px-4">
          <SearchDropdown
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
