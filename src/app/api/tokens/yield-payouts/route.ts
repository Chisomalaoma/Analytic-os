import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TimePeriod = '1d' | '7d' | '30d' | '1yr'

/**
 * GET /api/tokens/yield-payouts?period=30d
 * Calculate MARKET-WIDE total yield payouts for all tokens based on time period
 * 
 * NOTE: This calculates yield across ALL USERS for market statistics.
 * For individual user yield, use /api/portfolio/summary instead.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || '30d') as TimePeriod

    // Get all active tokens
    const tokens = await prisma.token.findMany({
      where: { isActive: true },
      select: {
        symbol: true,
        annualYield: true,
        price: true
      }
    })

    // Calculate period multiplier
    let periodMultiplier = 0
    switch (period) {
      case '1d':
        periodMultiplier = 1 / 365
        break
      case '7d':
        periodMultiplier = 7 / 365
        break
      case '30d':
        periodMultiplier = 30 / 365
        break
      case '1yr':
        periodMultiplier = 1
        break
    }

    // Calculate yield payout for each token
    const yieldPayouts: Record<string, number> = {}

    for (const token of tokens) {
      // Get all holdings for this token
      const holdings = await prisma.tokenHolding.findMany({
        where: {
          tokenId: token.symbol,
          quantity: { gt: 0 }
        },
        select: {
          quantity: true,
          accumulatedYield: true
        }
      })

      // Calculate total portfolio value for this token
      const totalPortfolioValue = holdings.reduce((sum, h) => {
        const value = Number(h.quantity) * (token.price / 100) // Convert price from kobo to Naira
        return sum + value
      }, 0)

      // Calculate yield for the period
      // Yield = Portfolio Value × Annual Yield × Period Multiplier
      const annualYieldDecimal = Number(token.annualYield) / 100
      const periodYield = totalPortfolioValue * annualYieldDecimal * periodMultiplier

      yieldPayouts[token.symbol] = Math.round(periodYield * 100) / 100 // Round to 2 decimals
    }

    return NextResponse.json({
      success: true,
      period,
      yieldPayouts
    })
  } catch (error) {
    console.error('Yield payouts calculation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate yield payouts' },
      { status: 500 }
    )
  }
}
