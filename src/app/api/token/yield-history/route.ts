import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * GET /api/token/yield-history - Get yield history for current user's holdings of a token
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tokenSymbol = searchParams.get('symbol')
    const period = searchParams.get('period') || '30d' // Default to 30 days

    console.log('API called with:', { tokenSymbol, period, userId: session.user.id })

    if (!tokenSymbol) {
      return NextResponse.json(
        { success: false, error: 'Token symbol is required' },
        { status: 400 }
      )
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get token
    const token = await prisma.token.findUnique({
      where: { symbol: tokenSymbol.toUpperCase() }
    })

    console.log('Token lookup:', { 
      tokenSymbol: tokenSymbol.toUpperCase(), 
      found: !!token, 
      annualYield: token?.annualYield?.toString() 
    })

    if (!token) {
      return NextResponse.json(
        { success: false, error: `Token ${tokenSymbol} not found` },
        { status: 404 }
      )
    }

    // Check if CURRENT USER has any holdings for this token
    const userHolding = await prisma.tokenHolding.findFirst({
      where: {
        tokenId: token.symbol,
        userId: session.user.id  // ✅ FIXED: Filter by current user
      },
      select: {
        totalInvested: true,
        accumulatedYield: true,
        quantity: true
      }
    })

    console.log('User holding lookup:', { 
      userId: session.user.id,
      tokenSymbol: token.symbol,
      hasHolding: !!userHolding,
      totalInvested: userHolding?.totalInvested?.toString(),
      accumulatedYield: userHolding?.accumulatedYield?.toString(),
      quantity: userHolding?.quantity?.toString()
    })

    // If user has no holdings, return empty projection
    if (!userHolding || Number(userHolding.quantity) === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tokenSymbol: token.symbol,
          tokenName: token.name,
          annualYield: parseFloat(token.annualYield.toString()),
          baseInvestment: 0,
          hasActualHolding: false,
          period,
          history: [] // Empty array - no data to show
        }
      })
    }

    // User has actual holdings - calculate real yield progression
    const baseInvestment = parseFloat(userHolding.totalInvested.toString())
    const startingYield = parseFloat(userHolding.accumulatedYield.toString())
    const annualYield = parseFloat(token.annualYield.toString())
    
    console.log('Generating data for user with holdings:', { 
      annualYield, 
      baseInvestment, 
      startingYield,
      daysInPeriod: Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    })
    
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dataPoints = Math.min(daysInPeriod, 30) // Max 30 data points
    
    const chartData = []
    
    for (let i = 0; i <= dataPoints; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + Math.floor(i * (daysInPeriod / dataPoints)))
      
      // Calculate actual days from start for this data point
      const actualDaysFromStart = Math.floor(i * (daysInPeriod / dataPoints))
      
      // Calculate yield progression based on actual days
      const dailyYieldRate = annualYield / 365 / 100 // Convert percentage to decimal daily rate
      const newYieldForPeriod = baseInvestment * dailyYieldRate * actualDaysFromStart
      const totalYield = startingYield + newYieldForPeriod
      
      if (i === dataPoints) {
        console.log('Final calculation:', {
          i,
          actualDaysFromStart,
          dailyYieldRate,
          newYieldForPeriod,
          totalYield,
          period
        })
      }
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        yield: Number(totalYield.toFixed(2)),
        period: 'actual'
      })
    }

    console.log('Generated chart data:', chartData.slice(0, 3), '... total:', chartData.length)

    return NextResponse.json({
      success: true,
      data: {
        tokenSymbol: token.symbol,
        tokenName: token.name,
        annualYield: annualYield,
        baseInvestment: baseInvestment,
        hasActualHolding: true,
        period,
        history: chartData
      }
    })
  } catch (error) {
    console.error('Yield history fetch error:', error)
    return NextResponse.json(
      { success: false, error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
