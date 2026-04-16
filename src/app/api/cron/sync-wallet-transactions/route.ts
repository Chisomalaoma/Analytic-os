// Vercel Cron Job - Runs every 5 minutes to sync Monnify transactions
// Configure in vercel.json: "crons": [{ "path": "/api/cron/sync-wallet-transactions", "schedule": "*/5 * * * *" }]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMonnifyAccessToken } from '@/lib/monnify'
import { creditWallet } from '@/lib/wallet-service'
import { notifyWalletDeposit } from '@/lib/notifications'

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://api.monnify.com'

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting wallet transaction sync...')

    // Get all active wallets
    const wallets = await prisma.wallet.findMany({
      select: {
        id: true,
        userId: true,
        accountNumber: true,
      },
    })

    console.log(`[CRON] Found ${wallets.length} wallets to sync`)

    let totalSynced = 0
    let totalSkipped = 0
    const errors: string[] = []

    // Get Monnify access token once for all requests
    const accessToken = await getMonnifyAccessToken()

    // Process each wallet
    for (const wallet of wallets) {
      try {
        // Fetch transactions from Monnify for this reserved account
        const response = await fetch(
          `${MONNIFY_BASE_URL}/api/v1/transactions/search?accountNumber=${wallet.accountNumber}&page=0&size=20`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          errors.push(`Failed to fetch transactions for ${wallet.accountNumber}`)
          continue
        }

        const data = await response.json()
        const transactions = data.responseBody?.content || []

        // Process each transaction
        for (const tx of transactions) {
          // Only process successful incoming payments
          if (tx.paymentStatus !== 'PAID') {
            totalSkipped++
            continue
          }

          const transactionReference = tx.transactionReference
          const amountPaid = tx.amountPaid

          // Check if transaction already exists
          const existingTx = await prisma.transaction.findUnique({
            where: { reference: transactionReference },
          })

          if (existingTx) {
            totalSkipped++
            continue
          }

          // Credit the wallet
          const result = await creditWallet({
            walletId: wallet.id,
            amount: Math.round(amountPaid * 100), // Convert to kobo
            description: tx.paymentDescription || 'Wallet funding',
            reference: transactionReference,
            monnifyRef: transactionReference,
          })

          if (result.success) {
            totalSynced++
            console.log(`[CRON] Credited ${amountPaid} NGN to wallet ${wallet.accountNumber}`)

            // Send notification
            await notifyWalletDeposit(
              wallet.userId,
              Math.round(amountPaid * 100),
              transactionReference
            )
          } else {
            errors.push(`Failed to credit wallet ${wallet.accountNumber}: ${result.error}`)
          }
        }
      } catch (error: any) {
        errors.push(`Error processing wallet ${wallet.accountNumber}: ${error.message}`)
      }
    }

    console.log(`[CRON] Sync complete: ${totalSynced} synced, ${totalSkipped} skipped, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      skipped: totalSkipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[CRON] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}
