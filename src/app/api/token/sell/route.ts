import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyTokenSale } from '@/lib/notifications'

const sellTokenSchema = z.object({
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokensToSell: z.number().positive('Amount must be positive'),
})

interface SellTokenResponse {
  success: boolean
  sale?: {
    id: string
    tokensSold: number
    nairaReceived: number
    pricePerToken: number
    newTokenBalance: number
    newWalletBalance: number
    reference: string
  }
  error?: string
}

/**
 * POST /api/token/sell - Sell tokens for Naira
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = sellTokenSchema.parse(body)

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

    // Get user's token holding
    const holding = await prisma.tokenHolding.findUnique({
      where: {
        userId_tokenId: {
          userId: session.user.id,
          tokenId: data.tokenSymbol.toUpperCase()
        }
      }
    })

    if (!holding || Number(holding.quantity) < data.tokensToSell) {
      return NextResponse.json({
        success: false,
        error: `Insufficient tokens. You have ${Number(holding?.quantity || 0).toFixed(6)} ${data.tokenSymbol}`
      }, { status: 400 })
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'No wallet found' }, { status: 400 })
    }

    // Calculate Naira to receive before fee
    const grossNairaReceived = data.tokensToSell * TOKEN_PRICE_NAIRA
    
    // Calculate 0.35% transaction fee
    const TRANSACTION_FEE_RATE = 0.0035 // 0.35%
    const transactionFee = grossNairaReceived * TRANSACTION_FEE_RATE
    const netNairaReceived = grossNairaReceived - transactionFee
    const nairaInKobo = Math.floor(netNairaReceived * 100)

    // Generate unique reference
    const reference = `SELL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Credit wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: nairaInKobo } }
      })

      // 2. Calculate proportional totalInvested reduction
      const sellRatio = data.tokensToSell / Number(holding.quantity)
      const investedReduction = Number(holding.totalInvested) * sellRatio

      // 3. Update token holding
      const updatedHolding = await tx.tokenHolding.update({
        where: {
          userId_tokenId: {
            userId: session.user.id,
            tokenId: token.symbol
          }
        },
        data: {
          quantity: { decrement: data.tokensToSell },
          totalInvested: { decrement: investedReduction },
          updatedAt: new Date()
        }
      })

      // 4. Record sale as a transaction
      const saleTransaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount: nairaInKobo,
          description: `Sold ${data.tokensToSell} ${token.symbol} tokens`,
          reference,
          status: 'completed'
        }
      })

      // 5. Update token statistics
      await tx.token.update({
        where: { id: token.id },
        data: {
          volume: { increment: netNairaReceived }, // Use net amount for volume
          transactionCount: { increment: 1 }
        }
      })

      return {
        wallet: updatedWallet,
        holding: updatedHolding,
        transaction: saleTransaction
      }
    })

    // Send notification to user
    await notifyTokenSale(
      session.user.id,
      token.symbol,
      data.tokensToSell,
      netNairaReceived
    )

    return NextResponse.json({
      success: true,
      sale: {
        id: result.transaction.id,
        tokensSold: data.tokensToSell,
        grossAmount: Math.round(grossNairaReceived * 100) / 100,
        transactionFee: Math.round(transactionFee * 100) / 100,
        nairaReceived: Math.round(netNairaReceived * 100) / 100,
        pricePerToken: TOKEN_PRICE_NAIRA,
        newTokenBalance: Number(result.holding.quantity),
        newWalletBalance: result.wallet.balance,
        reference
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    console.error('Token sale error:', error)
    return NextResponse.json({ success: false, error: 'Sale failed' }, { status: 500 })
  }
}
