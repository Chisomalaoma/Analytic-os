import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMonnifyAccessToken } from '@/lib/monnify'
import { creditWallet } from '@/lib/wallet-service'
import { notifyWalletDeposit } from '@/lib/notifications'

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://api.monnify.com'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    console.log('[SYNC] Syncing transactions for wallet:', wallet.accountNumber)

    // Get Monnify access token
    const accessToken = await getMonnifyAccessToken()

    // Fetch transactions from Monnify for this reserved account
    const response = await fetch(
      `${MONNIFY_BASE_URL}/api/v1/transactions/search?accountNumber=${wallet.accountNumber}&page=0&size=50`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[SYNC] Monnify API error:', errorText)
      throw new Error('Failed to fetch transactions from Monnify')
    }

    const data = await response.json()
    const transactions = data.responseBody?.content || []

    console.log('[SYNC] Found', transactions.length, 'transactions from Monnify')

    let syncedCount = 0
    let skippedCount = 0

    // Process each transaction
    for (const tx of transactions) {
      // Only process successful incoming payments
      if (tx.paymentStatus !== 'PAID') {
        skippedCount++
        continue
      }

      const transactionReference = tx.transactionReference
      const amountPaid = tx.amountPaid

      // Check if transaction already exists
      const existingTx = await prisma.transaction.findUnique({
        where: { reference: transactionReference },
      })

      if (existingTx) {
        skippedCount++
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
        syncedCount++
        console.log('[SYNC] Credited', amountPaid, 'NGN for transaction', transactionReference)

        // Send notification
        await notifyWalletDeposit(
          wallet.userId,
          Math.round(amountPaid * 100),
          transactionReference
        )
      } else {
        console.error('[SYNC] Failed to credit wallet:', result.error)
      }
    }

    // Get updated wallet balance
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    })

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      total: transactions.length,
      balance: updatedWallet?.balance || 0,
    })
  } catch (error: any) {
    console.error('[SYNC] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
