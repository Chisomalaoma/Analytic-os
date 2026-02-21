'use client'

import { useState, useRef, useEffect } from 'react'

interface MobileFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  activeTime: string
  onTimeChange: (time: string) => void
}

export function MobileFilters({ activeFilter, onFilterChange, activeTime, onTimeChange }: MobileFiltersProps) {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filters = [
    { id: 'all', label: 'All listings' },
    { id: 'volume', label: 'Top volume' },
    { id: 'upcoming', label: 'Upcoming' },
  ]

  const timeFilters = [
    { id: '1d', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '1yr', label: '1YR' },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false)
      }
    }
    if (showTimeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTimeDropdown])

  const activeTimeLabel = timeFilters.find(t => t.id === activeTime)?.label || '24H'

  return (
    <div className="sticky top-[129px] z-40 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      {/* Single Row Layout with Time Dropdown and Filter Buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Time Filter Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] transition-colors flex items-center gap-1.5 min-w-[70px]"
            >
              <span className="text-xs font-medium">{activeTimeLabel}</span>
              <svg 
                className={`w-3 h-3 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showTimeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-[100px] bg-[#1A1A1A] border border-[#252525] rounded-lg shadow-xl overflow-hidden z-[100]">
                {timeFilters.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => {
                      onTimeChange(time.id)
                      setShowTimeDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                      activeTime === time.id
                        ? 'bg-[#4459FF] text-white'
                        : 'text-gray-400 hover:bg-[#252525]'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#1A1A1A] flex-shrink-0" />

          {/* Category Filter Buttons - Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 -mr-4 pr-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === filter.id
                    ? 'bg-[#4459FF] text-white'
                    : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525]'
                }`}
              >
                <span className="text-xs font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
