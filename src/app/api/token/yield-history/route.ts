import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/token/yield-history - Get yield history for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenSymbol = searchParams.get('symbol')
    const period = searchParams.get('period') || '30d' // Default to 30 days

    console.log('API called with:', { tokenSymbol, period })

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

    // Generate simulated yield data based on annual yield
    const annualYield = parseFloat(token.annualYield.toString())
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dataPoints = Math.min(daysInPeriod, 30) // Max 30 data points
    
    console.log('Generating data:', { annualYield, daysInPeriod, dataPoints })
    
    const chartData = []
    
    for (let i = 0; i <= dataPoints; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + Math.floor(i * (daysInPeriod / dataPoints)))
      
      // Simulate accumulated yield over time with a base investment of ₦1000
      const baseInvestment = 1000
      const dailyYieldRate = annualYield / 365 / 100 // Convert percentage to decimal daily rate
      const accumulatedYield = baseInvestment * dailyYieldRate * i
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        yield: Number(accumulatedYield.toFixed(2)),
        period: 'simulated'
      })
    }

    console.log('Generated chart data:', chartData.slice(0, 3), '... total:', chartData.length)

    return NextResponse.json({
      success: true,
      data: {
        tokenSymbol: token.symbol,
        tokenName: token.name,
        annualYield: annualYield,
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
