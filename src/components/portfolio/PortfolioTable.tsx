'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import WatchlistButton from '@/components/watchlist/WatchlistButton'
import { calculateAccumulatedYield, calculateTotalYield } from '@/lib/yield-calculator'
import { useCurrency } from '@/contexts/CurrencyContext';

interface HoldingsToken {
  id: string
  tokenId: string
  quantity: number
  averagePrice: number
  totalInvested: number
  accumulatedYield: number
  lastYieldUpdate: Date
  tokenSharePercent: number // User's share of this token
  token: {
    id: string
    name: string
    symbol: string
    price: number
    annualYield: number
    industry: string
    riskLevel: string
    logoUrl: string | null
  }
}

interface PortfolioTableProps {
  holdings: HoldingsToken[]
  watchlistIds: string[]
  onWatchlistToggle?: (tokenId: string, isInWatchlist: boolean) => void
}

function formatUnits(units: number): string {
  // Show up to 6 decimal places, remove trailing zeros
  return units.toFixed(6).replace(/\.?0+$/, '')
}

export default function PortfolioTable({ holdings, watchlistIds, onWatchlistToggle }: PortfolioTableProps) {
  const router = useRouter()
  const { formatAmount } = useCurrency()
  
  // Calculate total portfolio value for allocation percentages
  const totalPortfolioValue = holdings.reduce((sum, h) => {
    if (h.quantity === 0) return sum
    return sum + h.totalInvested
  }, 0)

  const handleRowClick = (tokenSymbol: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on the watchlist button
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }
    router.push(`/dashboard/token?symbol=${tokenSymbol}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-gray-400 text-sm border-b border-gray-800">
            <th className="py-3 px-4 font-medium">Asset</th>
            <th className="py-3 px-4 font-medium">Price</th>
            <th className="py-3 px-4 font-medium">Holdings</th>
            <th className="py-3 px-4 font-medium">Avg. Cost</th>
            <th className="py-3 px-4 font-medium">Total Yield</th>
            <th className="py-3 px-4 font-medium">Allocation</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const isWatchlistOnly = holding.quantity === 0
            const isInWatchlist = watchlistIds.includes(holding.tokenId)

            // Calculate current market value
            const currentValue = holding.quantity * (holding.token.price / 100)
            
            // Calculate new accumulated yield since last update (based on current portfolio value)
            const newAccumulatedYield = calculateAccumulatedYield(
              currentValue,  // Use current portfolio value, not investment amount
              Number(holding.token.annualYield),
              new Date(holding.lastYieldUpdate)
            )
            
            // Total accumulated yield
            const totalAccumulatedYield = holding.accumulatedYield + newAccumulatedYield
            
            // Calculate total yield (unrealized gain/loss + accumulated yield)
            const totalYield = calculateTotalYield(
              currentValue,
              holding.totalInvested,
              totalAccumulatedYield
            )
            
            const yieldPercent = holding.totalInvested > 0 
              ? (totalYield / holding.totalInvested) * 100 
              : 0

            return (
              <tr 
                key={holding.id} 
                onClick={(e) => handleRowClick(holding.token.symbol, e)}
                className="border-t border-gray-800 hover:bg-gray-900 transition cursor-pointer"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {holding.token.logoUrl ? (
                        <Image
                          src={holding.token.logoUrl}
                          alt={holding.token.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {holding.token.symbol.substring(0, 2)}
                        </div>
                      )}
                      {isInWatchlist && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#0A0A0A]" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{holding.token.symbol}</div>
                      <div className="text-xs text-gray-400">{holding.token.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{formatAmount(holding.token.price / 100)}</div>
                  <div className="text-xs text-green-400">+{Math.round(Number(holding.token.annualYield))}% APY</div>
                </td>
                <td className="py-3 px-4">
                  {isWatchlistOnly ? (
                    <div className="text-gray-500 text-sm">Not purchased</div>
                  ) : (
                    <>
                      <div className="font-semibold text-white">{formatAmount(holding.totalInvested)}</div>
                      <div className="text-xs text-gray-400">{formatUnits(holding.quantity)} units</div>
                    </>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isWatchlistOnly ? (
                    <div className="text-gray-500 text-sm">---</div>
                  ) : (
                    <>
                      <div className="font-semibold text-white">{formatAmount(holding.averagePrice / 100)}</div>
                      <div className="text-xs text-gray-400">per unit</div>
                    </>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isWatchlistOnly ? (
                    <div className="text-gray-500 text-sm">---</div>
                  ) : (
                    <>
                      <div className={`font-semibold ${totalYield >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalYield >= 0 ? '+' : ''}{formatAmount(totalYield, 2)}
                      </div>
                      <div className={`text-xs ${yieldPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {yieldPercent >= 0 ? '+' : ''}{yieldPercent < 1 && yieldPercent > 0 ? yieldPercent.toFixed(2) : Math.round(yieldPercent)}%
                      </div>
                    </>
                  )}
                </td>
                <td className="py-3 px-4 w-32">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-800 rounded">
                      <div
                        className="h-2 bg-white rounded"
                        style={{ 
                          width: `${Math.min(100, holding.tokenSharePercent)}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {holding.tokenSharePercent.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <WatchlistButton
                    tokenId={holding.tokenId}
                    initialIsInWatchlist={isInWatchlist}
                    size="sm"
                    onToggle={(newState) => onWatchlistToggle?.(holding.tokenId, newState)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
