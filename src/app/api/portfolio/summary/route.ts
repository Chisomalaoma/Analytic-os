import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateAccumulatedYield } from '@/lib/yield-calculator'

interface PortfolioSummaryResponse {
  success: boolean
  data?: {
    totalInvested: number      // Sum of nairaAmountSpent in Naira
    totalYield: number         // Accumulated yield in Naira
    yieldPercentage: number    // Yield as percentage of investment
    transactionCount: number   // Total transactions (buy + sell) in last 30 days
    buyCount: number           // Buy transactions count
    sellCount: number          // Sell transactions count
    holdCount: number          // Number of different tokens currently held
    lockedYield: number        // Locked yield until maturity
    lastUpdated: string        // ISO timestamp
  }
  error?: string
}

/**
 * GET /api/portfolio/summary - Get user's portfolio summary
 */
export async function GET(): Promise<NextResponse<PortfolioSummaryResponse>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all holdings with token info for yield calculation
    const holdings = await prisma.tokenHolding.findMany({
      where: {
        userId,
        quantity: { gt: 0 }
      },
      select: {
        totalInvested: true,
        accumulatedYield: true,
        lastYieldUpdate: true,
        tokenId: true,
        quantity: true,
        lockedYield: true
      }
    })

    // Get token prices for current market value calculation
    const tokenIds = [...new Set(holdings.map(h => h.tokenId))]
    const tokens = await prisma.token.findMany({
      where: {
        symbol: { in: tokenIds }
      },
      select: {
        symbol: true,
        annualYield: true,
        price: true
      }
    })

    // Create token price map
    const tokenPriceMap = new Map(tokens.map(t => [t.symbol, t]))

    // Calculate total invested and total yield using CORRECT formula
    let totalInvested = 0
    let totalYield = 0
    let totalLockedYield = 0

    for (const holding of holdings) {
      const token = tokenPriceMap.get(holding.tokenId)
      if (!token) continue

      const invested = Number(holding.totalInvested)
      const quantity = Number(holding.quantity)
      const accumulatedYield = Number(holding.accumulatedYield)
      
      // Calculate current market value
      const currentValue = quantity * (token.price / 100) // Convert from kobo to Naira
      
      // Calculate new accumulated yield since last update
      const now = new Date()
      const lastUpdate = new Date(holding.lastYieldUpdate)
      const msPerDay = 24 * 60 * 60 * 1000
      const daysSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / msPerDay
      const dailyYield = (currentValue * (Number(token.annualYield) / 100)) / 365
      const newAccumulatedYield = dailyYield * daysSinceLastUpdate
      
      // Total accumulated yield
      const totalAccumulatedYield = accumulatedYield + newAccumulatedYield
      
      // CORRECT FORMULA: Total Yield = (Current Value - Invested) + Accumulated Yield
      const unrealizedGainLoss = currentValue - invested
      const holdingTotalYield = unrealizedGainLoss + totalAccumulatedYield
      
      totalInvested += invested
      totalYield += holdingTotalYield
      totalLockedYield += Number(holding.lockedYield || 0)
    }

    console.log('Portfolio Summary Calculation:', {
      userId,
      totalInvested,
      totalYield,
      totalLockedYield,
      holdingsCount: holdings.length
    })

    // Query 3: Count transactions in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Count buy transactions
    const recentPurchases = await prisma.tokenPurchase.count({
      where: {
        userId,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Count sell transactions
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    const recentSales = wallet ? await prisma.transaction.count({
      where: {
        walletId: wallet.id,
        type: 'credit',
        status: 'completed',
        description: { contains: 'Sold' },
        createdAt: { gte: thirtyDaysAgo }
      }
    }) : 0

    // Total transactions = buy + sell
    const totalTransactions = recentPurchases + recentSales

    // Count number of different tokens currently held (holdings with quantity > 0)
    const holdCount = holdings.length

    // Calculate yield percentage based on total yield
    const yieldPercentage = totalInvested > 0 
      ? (totalYield / totalInvested) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalYield: Math.round(totalYield * 100) / 100, // Use CORRECT total yield calculation
        yieldPercentage: Math.round(yieldPercentage * 100) / 100,
        transactionCount: totalTransactions,
        buyCount: recentPurchases,
        sellCount: recentSales,
        holdCount,
        lockedYield: Math.round(totalLockedYield * 100) / 100,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Portfolio summary error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}
