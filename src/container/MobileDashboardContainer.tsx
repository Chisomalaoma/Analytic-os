'use client'

import { useState, useEffect, useRef } from 'react'
import { MobileHeader } from '@/components/dashboard/MobileHeader'
import { MobileStatsBar } from '@/components/dashboard/MobileStatsBar'
import { MobileFilters } from '@/components/dashboard/MobileFilters'
import { MobileTokenRow } from '@/components/dashboard/MobileTokenRow'
import { MobileExploreMenu } from '@/components/dashboard/MobileExploreMenu'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import SearchDropdown from '@/components/dashboard/SearchDropdown'
import { KYCBanner } from '@/components/dashboard/KYCBanner'
import { SmileIDKYCModal } from '@/components/dashboard/SmileIDKYCModal'
import { useCurrency } from '@/contexts/CurrencyContext'

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
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [kycStatus, setKycStatus] = useState<string>('pending')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeTime, setActiveTime] = useState('1d')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [yieldPayouts, setYieldPayouts] = useState<{ [key: string]: number }>({})
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const { formatAmount } = useCurrency()

  // Check KYC status
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const res = await fetch('/api/kyc/status')
        const data = await res.json()
        if (data.status) {
          setKycStatus(data.status)
        }
      } catch (error) {
        console.error('Failed to fetch KYC status:', error)
      }
    }
    checkKYCStatus()
  }, [])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        
        // Fetch yield payouts
        const yieldRes = await fetch(`/api/tokens/yield-payouts?period=${activeTime}`)
        const yieldData = await yieldRes.json()
        
        if (data.success && data.tokens) {
          let filtered = [...data.tokens]
          
          // Filter based on active filter (tab)
          if (activeFilter === 'volume') {
            // Sort by volume (highest first)
            filtered = filtered.sort((a: Token, b: Token) => b.volume - a.volume)
          } else if (activeFilter === 'upcoming') {
            // Show tokens with future listing dates
            const now = new Date()
            filtered = filtered.filter((t: Token) => new Date(t.listingDate) > now)
            filtered = filtered.sort((a: Token, b: Token) => 
              new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime()
            )
          } else {
            // All listings - sort by newest first
            filtered = filtered.sort((a: Token, b: Token) => 
              new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
            )
          }
          
          setTokens(filtered)
        }
        
        if (yieldData.success) {
          setYieldPayouts(yieldData.yieldPayouts)
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [activeTime, activeFilter])

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

    // Use a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
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
    }, 100)

    return () => clearTimeout(timer)
  }, [loading, tokens.length])

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 safe-bottom">
      {/* KYC Banner - Show only if KYC is not verified */}
      {kycStatus !== 'verified' && (
        <div className="px-4 pt-4">
          <KYCBanner onStartKYC={() => setShowKYCModal(true)} />
        </div>
      )}
      
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
        <div className="sticky top-[175px] z-20 bg-[#0A0A0A] border-b border-[#1A1A1A]">
          <div className="flex">
            {/* Fixed TOKEN Column Header */}
            <div className="flex-shrink-0 w-[180px] pl-4 pr-2 py-2.5">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">TOKEN</div>
            </div>
            
            {/* Scrollable Columns Header */}
            <div ref={headerScrollRef} className="flex-1 overflow-x-auto scrollbar-hide horizontal-scroll" style={{ pointerEvents: 'auto' }}>
              <div className="flex min-w-max">
                {/* Price Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">PRICE</div>
                </div>
                
                {/* Industry Column */}
                <div className="w-[120px] px-3 py-2.5 text-center">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">INDUSTRY</div>
                </div>
                
                {/* Annual Yield Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">ANNUAL YIELD</div>
                </div>
                
                {/* Yield Payout Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">YIELD PAYOUT</div>
                </div>
                
                {/* Volume Column */}
                <div className="w-[100px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">VOLUME</div>
                </div>
                
                {/* Time Period Column (dynamic based on dropdown) */}
                <div className="w-[80px] px-3 py-2.5 text-right">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{activeTime}</div>
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
                      {/* Industry */}
                      <div className="w-[120px] px-3 py-3 text-center">
                        <div className="h-3 w-16 bg-[#1A1A1A] rounded mx-auto" />
                      </div>
                      {/* Annual Yield */}
                      <div className="w-[100px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* Yield Payout */}
                      <div className="w-[100px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* Volume */}
                      <div className="w-[100px] px-3 py-3 text-right">
                        <div className="h-3 w-16 bg-[#1A1A1A] rounded ml-auto" />
                      </div>
                      {/* Time Period */}
                      <div className="w-[80px] px-3 py-3 text-right">
                        <div className="h-3 w-12 bg-[#1A1A1A] rounded ml-auto" />
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
                  volume={token.volume / 100}
                  logo={token.logoUrl}
                  industry={token.industry}
                  annualYield={token.annualYield}
                  yieldPayout={formatAmount(yieldPayouts[token.symbol] || 0)}
                  timePeriod={activeTime}
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

      {/* SmileID KYC Modal */}
      <SmileIDKYCModal
        open={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={() => {
          setKycStatus('in_progress')
          setShowKYCModal(false)
        }}
      />
    </div>
  )
}
