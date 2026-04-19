import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyTokenPurchase } from '@/lib/notifications'
import { calculateMonthlyYield, calculateMaturityDate } from '@/lib/yield-service'

const buyTokenSchema = z.object({
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  nairaAmount: z.number().min(1, 'Amount must be positive'),
})

interface BuyTokenResponse {
  success: boolean
  purchase?: {
    id: string
    nairaAmountSpent: number
    tokensReceived: number
    pricePerToken: number
    newTokenBalance: number
    newWalletBalance: number
    reference: string
  }
  error?: string
}

/**
 * POST /api/token/buy - Purchase tokens with Naira amount
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = buyTokenSchema.parse(body)

    // Get token details from database
    const token = await prisma.token.findUnique({
      where: { symbol: data.tokenSymbol.toUpperCase() }
    })

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token not found' }, { status: 404 })
    }

    if (!token.isActive) {
      return NextResponse.json({ success: false, error: 'Token is not available for trading' }, { status: 400 })
    }

    const TOKEN_PRICE_NAIRA = token.price / 100 // Convert from kobo to Naira
    const TOKEN_PRICE_KOBO = token.price

    // Validate minimum purchase
    if (data.nairaAmount < TOKEN_PRICE_NAIRA) {
      return NextResponse.json({
        success: false,
        error: `Minimum purchase is ₦${TOKEN_PRICE_NAIRA.toLocaleString('en-NG')}`
      }, { status: 400 })
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'No wallet found' }, { status: 400 })
    }

    // Calculate transaction fee (0.35%)
    const TRANSACTION_FEE_RATE = 0.0035 // 0.35%
    const transactionFee = data.nairaAmount * TRANSACTION_FEE_RATE
    const amountAfterFee = data.nairaAmount - transactionFee // Amount that goes to tokens after fee

    // Convert amounts to kobo for wallet operations
    const amountInKobo = data.nairaAmount * 100 // Total amount user pays
    const feeInKobo = Math.round(transactionFee * 100)

    // Check sufficient balance
    if (wallet.balance < amountInKobo) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You have ₦${(wallet.balance / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }, { status: 400 })
    }

    // Calculate tokens received based on amount AFTER fee deduction
    const tokensReceived = amountAfterFee / TOKEN_PRICE_NAIRA

    // Generate unique reference
    const reference = `TKN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Debit wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amountInKobo } }
      })

      // 2. Update or create token holding
      const existingHolding = await tx.tokenHolding.findUnique({
        where: {
          userId_tokenId: {
            userId: session.user.id,
            tokenId: token.symbol
          }
        }
      })

      let holding
      if (existingHolding) {
        // Calculate new average price (in kobo)
        const oldTotalCost = Number(existingHolding.quantity) * Number(existingHolding.averagePrice)
        const newPurchaseCost = tokensReceived * TOKEN_PRICE_KOBO
        const newTotalQuantity = Number(existingHolding.quantity) + tokensReceived
        const newAveragePrice = (oldTotalCost + newPurchaseCost) / newTotalQuantity
        const newTotalInvested = Number(existingHolding.totalInvested) + amountAfterFee // Use amount after fee

        // Calculate new monthly yield based on new total investment
        const monthlyYield = calculateMonthlyYield(newTotalInvested, Number(token.annualYield))
        
        // Credit additional monthly yield for the new investment
        const additionalMonthlyYield = calculateMonthlyYield(amountAfterFee, Number(token.annualYield))

        holding = await tx.tokenHolding.update({
          where: {
            userId_tokenId: {
              userId: session.user.id,
              tokenId: token.symbol
            }
          },
          data: {
            quantity: { increment: tokensReceived },
            averagePrice: newAveragePrice,
            totalInvested: newTotalInvested,
            accumulatedYield: { increment: additionalMonthlyYield }, // Credit additional yield immediately
            lockedYield: { increment: additionalMonthlyYield }, // Credit additional yield immediately
            monthlyYieldAmount: monthlyYield,
            lastYieldUpdate: new Date(),
            updatedAt: new Date()
          }
        })
      } else {
        // First purchase - initialize yield tracking
        const monthlyYield = calculateMonthlyYield(amountAfterFee, Number(token.annualYield)) // Use amount after fee
        const maturityDate = calculateMaturityDate(new Date(), 12) // 12 months maturity

        holding = await tx.tokenHolding.create({
          data: {
            userId: session.user.id,
            tokenId: token.symbol,
            quantity: tokensReceived,
            averagePrice: TOKEN_PRICE_KOBO,
            totalInvested: amountAfterFee, // Use amount after fee
            accumulatedYield: monthlyYield, // Credit first month's yield immediately
            lockedYield: monthlyYield, // Credit first month's yield immediately
            monthlyYieldAmount: monthlyYield,
            maturityDate: maturityDate,
            lastYieldAccrual: new Date(),
            lastYieldUpdate: new Date()
          }
        })
      }

      // 3. Record purchase
      const purchase = await tx.tokenPurchase.create({
        data: {
          userId: session.user.id,
          tokenId: token.symbol,
          nairaAmountSpent: data.nairaAmount, // Total amount spent (including fee)
          tokensReceived,
          pricePerToken: TOKEN_PRICE_KOBO,
          totalAmountKobo: amountInKobo,
          reference,
          status: 'completed'
        }
      })

      // 4. Update token statistics
      await tx.token.update({
        where: { id: token.id },
        data: {
          volume: { increment: amountAfterFee }, // Volume based on amount after fee
          transactionCount: { increment: 1 }
        }
      })

      return {
        wallet: updatedWallet,
        holding,
        purchase
      }
    })

    // Send notification to user
    await notifyTokenPurchase(
      session.user.id,
      token.symbol,
      tokensReceived,
      amountAfterFee // Use amount after fee for notification
    )

    return NextResponse.json({
      success: true,
      purchase: {
        id: result.purchase.id,
        nairaAmountSpent: data.nairaAmount,
        transactionFee: Math.round(transactionFee * 100) / 100, // Round to 2 decimal places
        amountAfterFee: Math.round(amountAfterFee * 100) / 100,
        tokensReceived,
        pricePerToken: TOKEN_PRICE_NAIRA,
        newTokenBalance: result.holding.quantity,
        newWalletBalance: result.wallet.balance,
        reference
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    console.error('Token purchase error:', error)
    return NextResponse.json({ success: false, error: 'Purchase failed' }, { status: 500 })
  }
}
