'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/contexts/CurrencyContext'

interface MobileTokenRowProps {
  tokenId: string
  symbol: string
  name: string
  price: number
  volume: number
  logo: string | null
  industry?: string
  annualYield?: number
  yieldPayout?: string
  timePeriod?: string
}

export function MobileTokenRow({
  tokenId,
  symbol,
  name,
  price,
  volume,
  logo,
  industry,
  annualYield,
  yieldPayout,
  timePeriod
}: MobileTokenRowProps) {
  const router = useRouter()
  const { formatAmount } = useCurrency()

  const handleClick = () => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    router.push(`/dashboard/token?symbol=${symbol}`)
  }

  return (
    <div
      onClick={handleClick}
      className="flex border-b border-[#1A1A1A] hover:bg-[#0F0F0F] active:bg-[#151515] transition-colors cursor-pointer touch-manipulation"
    >
      {/* Fixed TOKEN Column */}
      <div className="flex-shrink-0 w-[180px] pl-4 pr-2 py-3">
        <div className="flex items-center gap-2">
          {logo ? (
            <Image src={logo} alt={symbol} width={32} height={32} className="rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {symbol.substring(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">{symbol}</div>
            <div className="text-xs text-gray-500 truncate">{name}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Columns */}
      <div className="flex-1 overflow-x-auto scrollbar-hide horizontal-scroll data-scroll-container" style={{ pointerEvents: 'auto' }}>
        <div className="flex min-w-max">
          {/* Price */}
          <div className="w-[100px] px-3 py-3 text-right">
            <div className="font-bold text-white text-sm">{formatAmount(price)}</div>
          </div>

          {/* Industry */}
          <div className="w-[100px] px-3 py-3 text-left">
            <div className="text-xs font-medium text-gray-400">{industry || '-'}</div>
          </div>

          {/* Annual Yield */}
          <div className="w-[100px] px-3 py-3 text-right">
            <div className="text-xs font-medium text-white">{annualYield ? `${annualYield}%` : '-'}</div>
          </div>

          {/* Yield Payout */}
          <div className="w-[100px] px-3 py-3 text-right">
            <div className="text-xs font-medium text-green-500">{yieldPayout || 'N0'}</div>
          </div>

          {/* Volume */}
          <div className="w-[100px] px-3 py-3 text-right">
            <div className="text-xs font-medium text-gray-400">{formatAmount(volume)}</div>
          </div>

          {/* Time Period (from dropdown) */}
          <div className="w-[80px] px-3 py-3 text-right">
            <div className="text-xs font-medium text-gray-400">{timePeriod || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
