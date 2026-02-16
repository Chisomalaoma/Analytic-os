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
  const headerScrollRef = useRef<HTMLDivElement>(null)

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

  // Sync header scroll with data scroll
  useEffect(() => {
    const headerScroll = headerScrollRef.current
    if (!headerScroll) return

    // Get all data scroll containers
    const dataScrollElements = document.querySelectorAll('.data-scroll-container')
    
    const syncFromHeader = () => {
      dataScrollElements.forEach((el) => {
        (el as HTMLElement).scrollLeft = headerScroll.scrollLeft
      })
    }

    const syncToHeader = (e: Event) => {
      const target = e.target as HTMLElement
      headerScroll.scrollLeft = target.scrollLeft
      // Sync all other data containers
      dataScrollElements.forEach((el) => {
        if (el !== target) {
          (el as HTMLElement).scrollLeft = target.scrollLeft
        }
      })
    }

    headerScroll.addEventListener('scroll', syncFromHeader)
    dataScrollElements.forEach((el) => {
      el.addEventListener('scroll', syncToHeader)
    })

    return () => {
      headerScroll.removeEventListener('scroll', syncFromHeader)
      dataScrollElements.forEach((el) => {
        el.removeEventListener('scroll', syncToHeader)
      })
    }
  }, [loading])

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

      {/* Token List - Horizontally Scrollable */}
      <div className="pb-4">
        {/* Table Header - Sticky with Fixed TOKEN and Scrollable Columns */}
        <div className="sticky top-[175px] z-30 bg-[#0A0A0A] border-b border-[#1A1A1A]">
          <div className="flex">
            {/* Fixed TOKEN Column Header */}
            <div className="flex-shrink-0 w-[180px] pl-4 pr-2 py-2.5">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">TOKEN</div>
            </div>
            
            {/* Scrollable Columns Header */}
            <div ref={headerScrollRef} className="flex-1 overflow-x-auto scrollbar-hide horizontal-scroll">
              <div className="flex min-w-max">
                {/* Price Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">PRICE</div>
                </div>
                
                {/* 1H Column */}
                <div className="w-[80px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">1H</div>
                </div>
                
                {/* 6H Column */}
                <div className="w-[80px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">6H</div>
                </div>
                
                {/* 24H Column */}
                <div className="w-[80px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">24H</div>
                </div>
                
                {/* Volume Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">VOLUME</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Rows Container */}
        <div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex border-b border-[#1A1A1A] animate-pulse">
                  {/* Fixed TOKEN Column */}
                  <div className="flex-shrink-0 w-[180px] pl-4 pr-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-16 bg-[#1A1A1A] rounded mb-1" />
                        <div className="h-3 w-24 bg-[#1A1A1A] rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Columns */}
                  <div className="flex-1 overflow-x-auto scrollbar-hide data-scroll-container">
                    <div className="flex min-w-max">
                      {/* Price */}
                      <div className="w-[100px] px-3 py-3 text-right">
                        <div className="h-4 w-16 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* 1H */}
                      <div className="w-[80px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* 6H */}
                      <div className="w-[80px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* 24H */}
                      <div className="w-[80px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* Volume */}
                      <div className="w-[100px] px-3 py-3 text-right">
                        <div className="h-3 w-16 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                    </div>
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
                  change={Math.random() * 20 - 10}
                  change1h={Math.random() * 10 - 5}
                  change6h={Math.random() * 15 - 7.5}
                  change24h={Math.random() * 20 - 10}
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
