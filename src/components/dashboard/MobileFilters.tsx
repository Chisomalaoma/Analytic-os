'use client'

interface MobileFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  activeTime: string
  onTimeChange: (time: string) => void
}

export function MobileFilters({ activeFilter, onFilterChange, activeTime, onTimeChange }: MobileFiltersProps) {
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

  return (
    <div className="sticky top-[129px] z-30 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      {/* Single Row Layout with Time Buttons and Filter Buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {/* Time Filter Buttons */}
          {timeFilters.map((time) => (
            <button
              key={time.id}
              onClick={() => onTimeChange(time.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTime === time.id
                  ? 'bg-[#4459FF] text-white'
                  : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525]'
              }`}
            >
              <span className="text-xs font-medium">{time.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-[#1A1A1A] flex-shrink-0 mx-1" />

          {/* Category Filter Buttons */}
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
