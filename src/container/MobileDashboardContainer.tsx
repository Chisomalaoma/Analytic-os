'use client'

import { useState, useEffect } from 'react'
import { MobileHeader } from '@/components/dashboard/MobileHeader'
import { MobileStatsBar } from '@/components/dashboard/MobileStatsBar'
import { MobileFilters } from '@/components/dashboard/MobileFilters'
import { MobileTokenRow } from '@/components/dashboard/MobileTokenRow'
import { MobileExploreMenu } from '@/components/dashboard/MobileExploreMenu'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import SearchModal from '@/components/dashboard/SearchModal'

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

  // Calculate age from listing date
  const getTokenAge = (listingDate: string) => {
    const now = new Date()
    const listed = new Date(listingDate)
    const diffMs = now.getTime() - listed.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d`
    if (diffHours > 0) return `${diffHours}h`
    return '< 1h'
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-4">
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
        {/* Table Header */}
        <div className="flex items-center px-4 py-2 border-b border-[#1A1A1A] bg-[#0A0A0A] sticky top-[201px] z-10">
          <div className="flex-1 text-xs text-gray-500 font-medium">TOKEN</div>
          <div className="text-xs text-gray-500 font-medium text-right w-20">PRICE</div>
          <div className="text-xs text-gray-500 font-medium text-right w-16 ml-2">VOLUME</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] animate-pulse">
                <div className="w-8 h-8 bg-[#1A1A1A] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-[#1A1A1A] rounded mb-1" />
                  <div className="h-3 w-32 bg-[#1A1A1A] rounded" />
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-[#1A1A1A] rounded mb-1" />
                  <div className="h-3 w-12 bg-[#1A1A1A] rounded" />
                </div>
                <div className="text-right w-16">
                  <div className="h-3 w-12 bg-[#1A1A1A] rounded" />
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
                age={getTokenAge(token.listingDate)}
                txns={Math.floor(Math.random() * 100000)} // Placeholder
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

      {/* Explore Menu */}
      <MobileExploreMenu
        isOpen={showExplore}
        onClose={() => setShowExplore(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
