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

  const getActiveTimeLabel = () => {
    const activeFilter = timeFilters.find(t => t.id === activeTime)
    return activeFilter?.label || '24H'
  }

  return (
    <div className="sticky top-[129px] z-40 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      {/* Two Row Layout for Better Spacing */}
      <div className="px-4 py-2">
        {/* Row 1: Time Filter on Left */}
        <div className="flex items-center justify-between mb-2">
          {/* Time Dropdown - Moved to Left */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4459FF] text-white rounded-lg hover:bg-[#3448EE] transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">{getActiveTimeLabel()}</span>
              <svg 
                className={`w-3 h-3 flex-shrink-0 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showTimeDropdown && (
              <div className="absolute left-0 top-full mt-2 w-28 bg-[#1A1A1A] rounded-lg shadow-xl border border-[#252525] py-1 z-[100]">
                {timeFilters.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => {
                      onTimeChange(time.id)
                      setShowTimeDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                      activeTime === time.id
                        ? 'bg-[#4459FF] text-white'
                        : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Filter Buttons - Full Width */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
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
  )
}
