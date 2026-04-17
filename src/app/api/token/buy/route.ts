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

    // Convert naira amount to kobo for wallet operations
    const amountInKobo = data.nairaAmount * 100

    // Check sufficient balance
    if (wallet.balance < amountInKobo) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You have ₦${(wallet.balance / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }, { status: 400 })
    }

    // Calculate tokens received (exact division for fractional tokens)
    const tokensReceived = data.nairaAmount / TOKEN_PRICE_NAIRA

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
        const newTotalInvested = Number(existingHolding.totalInvested) + data.nairaAmount

        // Calculate new monthly yield based on new total investment
        const monthlyYield = calculateMonthlyYield(newTotalInvested, Number(token.annualYield))

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
            monthlyYieldAmount: monthlyYield,
            lastYieldUpdate: new Date(),
            updatedAt: new Date()
          }
        })
      } else {
        // First purchase - initialize yield tracking
        const monthlyYield = calculateMonthlyYield(data.nairaAmount, Number(token.annualYield))
        const maturityDate = calculateMaturityDate(new Date(), 12) // 12 months maturity

        holding = await tx.tokenHolding.create({
          data: {
            userId: session.user.id,
            tokenId: token.symbol,
            quantity: tokensReceived,
            averagePrice: TOKEN_PRICE_KOBO,
            totalInvested: data.nairaAmount,
            accumulatedYield: 0,
            lockedYield: 0,
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
          nairaAmountSpent: data.nairaAmount,
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
          volume: { increment: data.nairaAmount }, // Increment in Naira, not kobo
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
      data.nairaAmount
    )

    return NextResponse.json({
      success: true,
      purchase: {
        id: result.purchase.id,
        nairaAmountSpent: data.nairaAmount,
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
