// src/app/api/cron/accrue-yields/route.ts
// Daily cron job to accrue monthly yields for all investments

import { NextResponse } from 'next/server'
import { accrueYieldForAllHoldings } from '@/lib/yield-service'

export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel cron jobs send this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting yield accrual...')
    
    const results = await accrueYieldForAllHoldings()
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`[CRON] Yield accrual complete: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful,
      failed,
      results
    })
  } catch (error) {
    console.error('[CRON] Yield accrual error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
