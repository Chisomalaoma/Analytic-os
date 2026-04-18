import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { initiateWithdrawal, getPaymentProvider } from '@/lib/payment-provider'
import { notifyWithdrawal } from '@/lib/notifications'

const withdrawSchema = z.object({
  bankAccountId: z.string().uuid(),
  amount: z.number().min(100, 'Minimum withdrawal is ₦1.00'), // in kobo, min ₦1
  narration: z.string().min(1).max(100).optional().default('Wallet withdrawal'),
})

/**
 * POST /api/wallet/withdraw - Withdraw money to bank account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = withdrawSchema.parse(body)

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'No wallet found' }, { status: 404 })
    }

    // Check sufficient balance
    if (wallet.balance < data.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance', currentBalance: wallet.balance },
        { status: 400 }
      )
    }

    // Get bank account
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: data.bankAccountId },
    })

    if (!bankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    // Generate unique reference
    const reference = `WD_${session.user.id}_${Date.now()}`

    // Get payment provider
    const provider = getPaymentProvider()
    console.log(`[WITHDRAWAL] Using payment provider: ${provider}`)

    // Initiate withdrawal
    try {
      const result = await initiateWithdrawal({
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
        bankCode: bankAccount.bankCode,
        amount: data.amount,
        narration: data.narration,
        reference,
      })

      // Create debit transaction
      await prisma.$transaction([
        // Deduct from wallet
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: data.amount } },
        }),
        // Create transaction record
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'debit',
            amount: data.amount,
            description: `Withdrawal to ${bankAccount.bankName} ${bankAccount.accountNumber}`,
            reference,
            monnifyRef: result.transactionReference,
            status: 'pending',
          },
        }),
      ])

      // Send notification to user
      await notifyWithdrawal(
        session.user.id,
        data.amount,
        bankAccount.accountNumber,
        'initiated'
      )

      return NextResponse.json({
        success: true,
        message: 'Withdrawal initiated successfully',
        transactionReference: result.transactionReference,
        status: result.status,
        amount: data.amount,
        fee: 0, // Calculate fee if needed
      })
    } catch (error) {
      console.error('Disbursement error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Withdrawal failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }
}
