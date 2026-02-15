import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { verifyBankAccount } from '@/lib/payment-provider'

const verifySchema = z.object({
  accountNumber: z.string().min(10).max(10).regex(/^\d+$/),
  bankCode: z.string().min(3).max(6),
})

/**
 * POST /api/bank-accounts/verify - Verify bank account name without saving
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = verifySchema.parse(body)

    // Verify account name with payment provider (Monnify or SafeHaven)
    const { accountName, accountNumber } = await verifyBankAccount(
      data.accountNumber,
      data.bankCode
    )

    return NextResponse.json({
      success: true,
      accountName,
      accountNumber,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error verifying bank account:', error)
    return NextResponse.json(
      { error: 'Failed to verify bank account. Please check the details.' },
      { status: 500 }
    )
  }
}
