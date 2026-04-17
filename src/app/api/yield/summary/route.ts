// src/app/api/yield/summary/route.ts
// Get user's yield summary

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserYieldSummary } from '@/lib/yield-service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const summary = await getUserYieldSummary(session.user.id)

    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error('[YIELD-SUMMARY] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get yield summary'
    }, { status: 500 })
  }
}
