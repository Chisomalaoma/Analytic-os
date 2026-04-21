import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch, SearchResult } from '@/hooks/useSearch'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

interface SearchDropdownProps {
  isOpen: boolean
  onClose: () => void
}

const SearchDropdown = forwardRef<HTMLDivElement, SearchDropdownProps>(({ isOpen, onClose }, ref) => {
  const router = useRouter()
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    recentSearches,
    clearSearch,
    loadRecentSearches,
    clearRecentSearches,
  } = useSearch({ debounceMs: 300 })

  const inputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'results'>('all')

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      loadRecentSearches()
    }
  }, [isOpen, loadRecentSearches])

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    // Format as Naira without decimals
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate to token detail page
    router.push(`/dashboard/token?symbol=${result.symbol}`)
    onClose()
  }

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  return (
    <>
      {/* Backdrop for closing */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown positioned relative to the trigger */}
      <div
        ref={ref}
        className="absolute right-0 mt-2 z-50 bg-[#181A20] border border-[#23262F] rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fadeIn"
        style={{ top: '100%' }}
      >
        {/* Search Input */}
        <div className="border-b border-[#23262F] px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base"
              placeholder="Search token, CA"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  // Perform search on enter
                  console.log('Search for:', query)
                }
              }}
            />
            {loading && (
              <svg className="animate-spin h-4 w-4 text-[#4459FF]" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {query && !loading && (
              <button
                onClick={() => {
                  clearSearch()
                  inputRef.current?.focus()
                }}
                className="p-1 hover:bg-[#23262F] rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 text-sm text-red-400 bg-red-500/10 border-b border-[#23262F]">
            {error}
          </div>
        )}

        {/* Results or Recent Searches */}
        <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#23262F] scrollbar-track-transparent">
          {query.trim() ? (
            // Search Results
            results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center px-4 py-3 hover:bg-[#23262F] transition cursor-pointer"
                  onClick={() => handleResultClick(item)}
                >
                  <div className="w-9 h-9 rounded-full bg-[#23262F] flex items-center justify-center text-white font-bold text-lg mr-3">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.symbol} • {item.industry}
                    </div>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <div className="text-white font-semibold text-sm">{formatPrice(item.price)}</div>
                    <div
                      className={`text-xs ${
                        item.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {formatChange(item.change)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // No results
              <div className="px-4 py-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No results found for &quot;{query}&quot;</p>
                <p className="text-gray-500 text-sm">Try a different search term</p>
              </div>
            )
          ) : (
            // Recent Searches
            recentSearches.length > 0 ? (
              <>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium uppercase">Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((searchQuery, idx) => (
                  <div
                    key={idx}
                    className="flex items-center px-4 py-2 hover:bg-[#23262F] transition cursor-pointer"
                    onClick={() => handleRecentSearchClick(searchQuery)}
                  >
                    <Clock className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-white">{searchQuery}</span>
                  </div>
                ))}
              </>
            ) : (
              // Empty state
              <div className="px-4 py-8 text-center">
                <Search className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Search for startups, companies, or tokens</p>
                <p className="text-gray-500 text-sm">Type to search or select from recent</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#23262F] px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Press Enter to search</span>
          <span>ESC to close</span>
        </div>
      </div>
    </>
  )
})

SearchDropdown.displayName = 'SearchDropdown'

export default SearchDropdown
