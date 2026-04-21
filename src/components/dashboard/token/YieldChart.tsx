'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'

interface YieldDataPoint {
  date: string
  yield: number
  period: string
}

interface YieldChartProps {
  tokenSymbol: string
}

export default function YieldChart({ tokenSymbol }: YieldChartProps) {
  const [data, setData] = useState<YieldDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [annualYield, setAnnualYield] = useState(0)
  const [baseInvestment, setBaseInvestment] = useState(0)
  const [hasActualHolding, setHasActualHolding] = useState(false)
  const { formatAmount } = useCurrency()

  useEffect(() => {
    const fetchYieldHistory = async () => {
      if (!tokenSymbol) {
        console.log('No tokenSymbol provided')
        return
      }
      
      try {
        setLoading(true)
        console.log('Fetching yield history for:', tokenSymbol, 'period:', period)
        const response = await fetch(`/api/token/yield-history?symbol=${tokenSymbol}&period=${period}`)
        const result = await response.json()
        
        console.log('API Response:', result)

        if (result.success && result.data) {
          console.log('Setting data:', result.data.history)
          console.log('Setting annualYield:', result.data.annualYield)
          setData(result.data.history)
          setAnnualYield(result.data.annualYield)
          setBaseInvestment(result.data.baseInvestment)
          setHasActualHolding(result.data.hasActualHolding)
        } else {
          console.error('API returned error:', result.error)
        }
      } catch (error) {
        console.error('Failed to fetch yield history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchYieldHistory()
  }, [tokenSymbol, period])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.date}</p>
          <p className="text-green-400 font-semibold">
            {formatAmount(payload[0].value, 2)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-[#151517] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <div key={p} className="h-8 w-12 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-[320px] bg-[#181A20] rounded flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#151517] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg">Yield Performance</h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {annualYield}% Annual Yield
            {!hasActualHolding && (
              <span className="text-yellow-400 ml-2">
                (Projection based on {formatAmount(baseInvestment)} investment)
              </span>
            )}
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                period === p
                  ? 'bg-[#4459FF] text-white'
                  : 'bg-[#181A20] text-gray-300 hover:bg-[#353945]'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] sm:h-[320px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#A1A1A1"
                tick={{ fill: '#A1A1A1', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis
                stroke="#A1A1A1"
                tick={{ fill: '#A1A1A1', fontSize: 12 }}
                tickFormatter={(value) => `₦${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="yield"
                stroke="#4ADE80"
                strokeWidth={2}
                fill="url(#yieldGradient)"
                dot={{ fill: '#4ADE80', r: 3 }}
                activeDot={{ r: 5, fill: '#4ADE80' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-[#181A20] rounded flex flex-col items-center justify-center text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-lg mb-2">📊</div>
              <div className="font-medium mb-1">No Holdings Yet</div>
              <div className="text-xs">Purchase {tokenSymbol} tokens to see your yield performance</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary - Only show if user has holdings */}
      {data.length > 0 && hasActualHolding && (
        <div className="mt-4 pt-4 border-t border-[#262626] grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">Current Yield</p>
            <p className="text-white font-semibold text-sm">
              {formatAmount(data[data.length - 1]?.yield || 0, 2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Avg Yield</p>
            <p className="text-white font-semibold text-sm">
              {formatAmount(
                data.reduce((sum, d) => sum + d.yield, 0) / data.length,
                2
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Total Growth</p>
            <p className="text-green-400 font-semibold text-sm">
              +{formatAmount(data[data.length - 1]?.yield || 0, 2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
