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
        quantity: true
      }
    })

    // Calculate total invested from holdings
    const totalInvested = holdings.reduce((sum, h) => sum + Number(h.totalInvested), 0)

    // Calculate total locked yield (this is what should be displayed as "Total Yield")
    let totalLockedYield = 0
    try {
      const holdingsWithLocked = await prisma.tokenHolding.findMany({
        where: {
          userId,
          quantity: { gt: 0 }
        },
        select: {
          lockedYield: true
        }
      })
      totalLockedYield = holdingsWithLocked.reduce((sum, h) => sum + Number(h.lockedYield || 0), 0)
    } catch (error) {
      // Field doesn't exist yet, use 0
      console.log('lockedYield field not available yet')
    }

    // Use locked yield as the main "Total Yield" display
    const displayTotalYield = totalLockedYield

    // Get token info for APY (for future use)
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

    // Calculate yield percentage based on locked yield
    const yieldPercentage = totalInvested > 0 
      ? (displayTotalYield / totalInvested) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalInvested,
        totalYield: Math.round(displayTotalYield * 100) / 100, // Show locked yield as total yield
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
