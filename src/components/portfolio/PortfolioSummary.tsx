'use client'

import { useState, useEffect } from 'react'
import { FaChartLine, FaRegCalendarAlt } from 'react-icons/fa'
import { useCurrency } from '@/contexts/CurrencyContext';

interface PortfolioData {
    totalInvested: number
    totalYield: number
    yieldPercentage: number
    transactionCount: number
    buyCount: number
    sellCount: number
    holdCount: number
    lastUpdated: string
    lockedYield?: number
}

export default function PortfolioSummary() {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { formatAmount } = useCurrency()

    useEffect(() => {
        async function fetchPortfolioSummary() {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch('/api/portfolio/summary')
                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch portfolio')
                }

                if (result.success && result.data) {
                    setPortfolioData(result.data)
                } else {
                    throw new Error(result.error || 'Failed to fetch portfolio')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchPortfolioSummary()
    }, [])

    if (loading) {
        return (
            <section className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 bg-[#101014] rounded-xl p-6 flex flex-col gap-2 border border-[#23262F] min-h-[160px] animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                            <div className="h-8 bg-gray-700 rounded w-2/3 mt-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/2 mt-2"></div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="mb-8">
                <div className="bg-[#101014] rounded-xl p-6 border border-red-700 text-red-400">
                    <p>Error loading portfolio: {error}</p>
                </div>
            </section>
        )
    }

    const { totalInvested, totalYield, yieldPercentage, transactionCount, buyCount, sellCount, holdCount, lockedYield = 0 } = portfolioData || {
        totalInvested: 0,
        totalYield: 0,
        yieldPercentage: 0,
        transactionCount: 0,
        buyCount: 0,
        sellCount: 0,
        holdCount: 0,
        lockedYield: 0
    }

    return (
        <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Total Portfolio Value */}
                <div className="flex-1 bg-[#101014] rounded-xl p-6 flex flex-col gap-2 border border-[#23262F] relative min-h-[160px]">
                    {yieldPercentage > 0 && (
                        <span className="absolute top-4 right-4 bg-transparent">
                            <span className="bg-[#0B2E1A] text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-700">
                                +{yieldPercentage.toFixed(1)}% yield
                            </span>
                        </span>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-lg">
                        <span className="text-xl font-bold">₦</span> Total Portfolio Value
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {formatAmount(totalInvested)}
                    </div>
                    <div className="text-green-400 text-sm font-medium">
                        {totalYield > 0 ? `+${formatAmount(totalYield, 2)} yield earned` : totalYield < 0 ? `${formatAmount(totalYield, 2)} loss` : 'No yield earned yet'}
                    </div>
                </div>

                {/* Total Yield */}
                <div className="flex-1 bg-[#101014] rounded-xl p-6 flex flex-col gap-2 border border-[#23262F] relative min-h-[160px]">
                    {yieldPercentage > 0 && (
                        <span className="absolute top-4 right-4 bg-transparent">
                            <span className="bg-[#0B2E1A] text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-700">
                                {yieldPercentage.toFixed(2)}% return
                            </span>
                        </span>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-lg">
                        <FaChartLine /> Total Yield
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {formatAmount(totalYield, 2)}
                    </div>
                    <div className="text-sm font-medium space-y-1">
                        <div className="text-green-400">
                            {totalInvested > 0 ? `Based on ${formatAmount(totalInvested)} invested` : 'Start investing to earn yield'}
                        </div>
                        {lockedYield > 0 && (
                            <div className="text-yellow-400">
                                {formatAmount(lockedYield, 2)} locked until maturity
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="flex-1 bg-[#101014] rounded-xl p-6 flex flex-col gap-2 border border-[#23262F] relative min-h-[160px]">
                    <span className="absolute top-4 right-4 bg-transparent">
                        <span className="bg-[#0A1A2E] text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-700">
                            Last 30 days
                        </span>
                    </span>
                    <div className="flex items-center gap-2 text-gray-400 text-lg">
                        <FaRegCalendarAlt /> Recent Activity
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {transactionCount} {transactionCount === 1 ? 'Transaction' : 'Transactions'}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">
                        {buyCount > 0 || sellCount > 0 || holdCount > 0
                            ? `${buyCount} ${buyCount === 1 ? 'buy' : 'buys'}, ${sellCount} ${sellCount === 1 ? 'sell' : 'sells'}, ${holdCount} ${holdCount === 1 ? 'hold' : 'holds'}` 
                            : '0 Transactions'}
                    </div>
                </div>
            </div>
        </section>
    )
}
