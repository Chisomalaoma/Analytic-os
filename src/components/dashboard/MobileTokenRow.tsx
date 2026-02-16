'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/contexts/CurrencyContext'

interface MobileTokenRowProps {
  tokenId: string
  symbol: string
  name: string
  price: number
  change: number
  change1h?: number
  change6h?: number
  change24h?: number
  volume: number
  logo: string | null
}

export function MobileTokenRow({
  tokenId,
  symbol,
  name,
  price,
  change,
  change1h,
  change6h,
  change24h,
  volume,
  logo
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

  const formatChange = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center border-b border-[#1A1A1A] hover:bg-[#0F0F0F] active:bg-[#151515] transition-colors cursor-pointer touch-manipulation min-w-max"
    >
      {/* Token Icon & Info - Sticky Left with Shadow */}
      <div className="flex items-center gap-2 sticky left-0 bg-[#0A0A0A] z-10 pr-3 pl-4 py-3 min-w-[160px] sticky-column-shadow">
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

      {/* Price */}
      <div className="text-right px-3 py-3 min-w-[90px]">
        <div className="font-bold text-white text-sm">{formatAmount(price)}</div>
      </div>

      {/* 1H Change */}
      <div className="text-right px-3 py-3 min-w-[70px]">
        <div className={`text-xs font-medium ${getChangeColor(change1h || change)}`}>
          {formatChange(change1h || change)}
        </div>
      </div>

      {/* 6H Change */}
      <div className="text-right px-3 py-3 min-w-[70px]">
        <div className={`text-xs font-medium ${getChangeColor(change6h || change * 1.5)}`}>
          {formatChange(change6h || change * 1.5)}
        </div>
      </div>

      {/* 24H Change */}
      <div className="text-right px-3 py-3 min-w-[70px]">
        <div className={`text-xs font-medium ${getChangeColor(change24h || change * 2)}`}>
          {formatChange(change24h || change * 2)}
        </div>
      </div>

      {/* Volume */}
      <div className="text-right px-3 py-3 min-w-[90px]">
        <div className="text-xs font-medium text-gray-400">{formatAmount(volume)}</div>
      </div>
    </div>
  )
}
