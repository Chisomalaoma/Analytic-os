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

  const timeFilters = ['1d', '7d', '30d', '1yr']

  return (
    <div className="sticky top-[129px] z-20 bg-[#0A0A0A] border-b border-[#1A1A1A]">
      {/* Main Filters */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeFilter === filter.id
                ? 'bg-[#4459FF] text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            <span className="text-sm font-medium">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Time Filters */}
      <div className="flex items-center gap-2 px-4 pb-3">
        {timeFilters.map((time) => (
          <button
            key={time}
            onClick={() => onTimeChange(time)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTime === time
                ? 'bg-[#4459FF] text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  )
}
