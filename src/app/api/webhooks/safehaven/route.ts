// src/app/api/webhooks/safehaven/route.ts
// SafeHaven webhook handler for payment notifications

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { creditWallet } from '@/lib/wallet-service'
import { notifyWalletDeposit, notifyWithdrawal } from '@/lib/notifications'
import crypto from 'crypto'

const SAFEHAVEN_WEBHOOK_SECRET = process.env.SAFEHAVEN_WEBHOOK_SECRET || ''

/**
 * Validate webhook signature
 */
function validateSignature(body: string, signature: string | null): boolean {
  if (!signature || !SAFEHAVEN_WEBHOOK_SECRET) {
    console.warn('[SafeHaven Webhook] Missing signature or secret')
    return false
  }

  const computedSignature = crypto
    .createHmac('sha256', SAFEHAVEN_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature.toLowerCase()),
      Buffer.from(computedSignature.toLowerCase())
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-safehaven-signature') || request.headers.get('signature')

    console.log('[SafeHaven Webhook] Received notification')
    console.log('[SafeHaven Webhook] Body:', bodyText)

    // Validate signature (skip if no signature for testing)
    if (signature && SAFEHAVEN_WEBHOOK_SECRET) {
      if (!validateSignature(bodyText, signature)) {
        console.warn('[SafeHaven Webhook] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else {
      console.log('[SafeHaven Webhook] Skipping signature validation')
    }

    const body = JSON.parse(bodyText)
    const { eventType, data } = body

    console.log(`[SafeHaven Webhook] Event type: ${eventType}`)

    // Handle successful credit (incoming payment)
    if (eventType === 'account.credited' || eventType === 'ACCOUNT_CREDITED') {
      const {
        transactionReference,
        accountNumber,
        amount,
        narration,
        senderAccountNumber,
        senderAccountName
      } = data

      if (!accountNumber) {
        console.warn('[SafeHaven Webhook] Missing account number')
        return NextResponse.json({ error: 'Missing account number' }, { status: 400 })
      }

      // Find wallet by account number
      const wallet = await prisma.wallet.findUnique({
        where: { accountNumber }
      })

      if (!wallet) {
        console.warn(`[SafeHaven Webhook] Wallet not found for account: ${accountNumber}`)
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
      }

      // Credit the wallet (amount is in NGN, convert to kobo)
      const amountInKobo = Math.round(amount * 100)
      const result = await creditWallet({
        walletId: wallet.id,
        amount: amountInKobo,
        description: narration || 'Wallet funding',
        reference: transactionReference,
        monnifyRef: transactionReference
      })

      if (!result.success) {
        if (result.error === 'Duplicate transaction') {
          console.log(`[SafeHaven Webhook] Duplicate transaction ignored: ${transactionReference}`)
          return NextResponse.json({ 
            successful: true,
            message: "success"
          }, { status: 200 })
        }
        console.error('[SafeHaven Webhook] Failed to credit wallet:', result.error)
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      console.log(`[SafeHaven Webhook] Credited ${amount} NGN to wallet ${wallet.id}`)
      
      // Send notification to user
      await notifyWalletDeposit(
        wallet.userId,
        amountInKobo,
        transactionReference
      )
      
      return NextResponse.json({ 
        successful: true,
        message: "success"
      }, { status: 200 })
    }

    // Handle successful transfer (withdrawal completed)
    if (eventType === 'transfer.successful' || eventType === 'TRANSFER_SUCCESSFUL') {
      const { paymentReference, transactionReference, status } = data

      // Update transaction status to completed
      const updatedTx = await prisma.transaction.findFirst({
        where: {
          OR: [
            { reference: paymentReference },
            { reference: transactionReference },
            { monnifyRef: transactionReference }
          ]
        },
        include: { wallet: true }
      })
      
      if (updatedTx) {
        await prisma.transaction.update({
          where: { id: updatedTx.id },
          data: { status: 'completed' }
        })
        
        // Notify user of successful withdrawal
        const bankAccount = await prisma.bankAccount.findFirst({
          where: { userId: updatedTx.wallet.userId }
        })
        
        if (bankAccount) {
          await notifyWithdrawal(
            updatedTx.wallet.userId,
            updatedTx.amount,
            bankAccount.accountNumber,
            'completed'
          )
        }
      }

      console.log(`[SafeHaven Webhook] Transfer completed: ${paymentReference}`)
      return NextResponse.json({ 
        successful: true,
        message: "success"
      }, { status: 200 })
    }

    // Handle failed transfer (refund the wallet)
    if (eventType === 'transfer.failed' || eventType === 'TRANSFER_FAILED') {
      const { paymentReference, transactionReference, amount } = data

      // Find the original transaction
      const originalTx = await prisma.transaction.findFirst({
        where: {
          OR: [
            { reference: paymentReference },
            { reference: transactionReference },
            { monnifyRef: transactionReference }
          ],
          type: 'debit'
        },
        include: { wallet: true }
      })

      if (originalTx && originalTx.status !== 'failed') {
        // Refund the wallet
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: originalTx.walletId },
            data: { balance: { increment: originalTx.amount } }
          }),
          prisma.transaction.update({
            where: { id: originalTx.id },
            data: { status: 'failed' }
          }),
          prisma.transaction.create({
            data: {
              walletId: originalTx.walletId,
              type: 'credit',
              amount: originalTx.amount,
              description: 'Refund: Transfer failed',
              reference: `${paymentReference}_refund_${Date.now()}`,
              monnifyRef: transactionReference,
              status: 'completed'
            }
          })
        ])

        // Notify user of failed withdrawal and refund
        const bankAccount = await prisma.bankAccount.findFirst({
          where: { userId: originalTx.wallet.userId }
        })

        if (bankAccount) {
          await notifyWithdrawal(
            originalTx.wallet.userId,
            originalTx.amount,
            bankAccount.accountNumber,
            'failed'
          )
        }

        console.log(`[SafeHaven Webhook] Refunded ${originalTx.amount} kobo for failed transfer`)
      }

      return NextResponse.json({ 
        successful: true,
        message: "success"
      }, { status: 200 })
    }

    // Log unhandled event types
    console.log(`[SafeHaven Webhook] Unhandled event type: ${eventType}`)
    return NextResponse.json({ 
      successful: true,
      message: "success"
    }, { status: 200 })

  } catch (error) {
    console.error('[SafeHaven Webhook] Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// GET handler for webhook testing
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'SafeHaven webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
