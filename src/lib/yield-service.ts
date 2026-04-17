// src/lib/yield-service.ts
// Yield accrual and management service

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Calculate monthly yield for an investment
 * Formula: (Principal × APY) ÷ 12
 * 
 * Example: ₦120,000 at 20% APY
 * Monthly yield = (120,000 × 0.20) ÷ 12 = ₦2,000
 */
export function calculateMonthlyYield(principal: number, annualYieldPercent: number): number {
  return (principal * (annualYieldPercent / 100)) / 12
}

/**
 * Calculate maturity date (default: 12 months from investment)
 */
export function calculateMaturityDate(investmentDate: Date, months: number = 12): Date {
  const maturity = new Date(investmentDate)
  maturity.setMonth(maturity.getMonth() + months)
  return maturity
}

/**
 * Accrue yield for a specific token holding
 * This credits the monthly yield to lockedYield
 */
export async function accrueYieldForHolding(holdingId: string) {
  const holding = await prisma.tokenHolding.findUnique({
    where: { id: holdingId }
  })

  if (!holding) {
    throw new Error('Holding not found')
  }

  // Check if maturity date has passed
  if (holding.maturityDate && new Date() > holding.maturityDate) {
    // Yield is now unlocked, don't accrue more
    return {
      success: false,
      message: 'Investment has matured'
    }
  }

  // Check if a month has passed since last accrual
  const lastAccrual = holding.lastYieldAccrual
  const now = new Date()
  const daysSinceLastAccrual = Math.floor((now.getTime() - lastAccrual.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceLastAccrual < 30) {
    return {
      success: false,
      message: 'Not yet time for next accrual'
    }
  }

  // Accrue the monthly yield
  const monthlyYield = holding.monthlyYieldAmount

  await prisma.tokenHolding.update({
    where: { id: holdingId },
    data: {
      lockedYield: {
        increment: monthlyYield
      },
      accumulatedYield: {
        increment: monthlyYield
      },
      lastYieldAccrual: now
    }
  })

  return {
    success: true,
    accrued: monthlyYield.toNumber(),
    message: `Accrued ₦${monthlyYield.toFixed(2)}`
  }
}

/**
 * Accrue yield for all active holdings
 * This should be run daily via cron job
 */
export async function accrueYieldForAllHoldings() {
  // Get all holdings that haven't matured yet
  const holdings = await prisma.tokenHolding.findMany({
    where: {
      OR: [
        { maturityDate: null },
        { maturityDate: { gt: new Date() } }
      ],
      totalInvested: { gt: 0 }
    }
  })

  const results = []

  for (const holding of holdings) {
    try {
      const result = await accrueYieldForHolding(holding.id)
      results.push({
        holdingId: holding.id,
        userId: holding.userId,
        ...result
      })
    } catch (error) {
      results.push({
        holdingId: holding.id,
        userId: holding.userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

/**
 * Unlock yield when maturity date is reached
 * This moves lockedYield to the user's wallet
 */
export async function unlockMaturedYield(holdingId: string) {
  const holding = await prisma.tokenHolding.findUnique({
    where: { id: holdingId },
    include: { user: { include: { wallet: true } } }
  })

  if (!holding) {
    throw new Error('Holding not found')
  }

  if (!holding.maturityDate || new Date() < holding.maturityDate) {
    throw new Error('Investment has not matured yet')
  }

  if (holding.lockedYield.toNumber() === 0) {
    return {
      success: false,
      message: 'No locked yield to unlock'
    }
  }

  const wallet = holding.user.wallet
  if (!wallet) {
    throw new Error('User has no wallet')
  }

  // Transfer locked yield to wallet
  const yieldAmount = holding.lockedYield.toNumber()
  const yieldInKobo = Math.round(yieldAmount * 100)

  await prisma.$transaction([
    // Credit wallet
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: yieldInKobo
        }
      }
    }),
    // Create transaction record
    prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit',
        amount: yieldInKobo,
        description: `Matured yield from ${holding.tokenId} investment`,
        reference: `YIELD_${holding.id}_${Date.now()}`,
        status: 'completed'
      }
    }),
    // Reset locked yield
    prisma.tokenHolding.update({
      where: { id: holdingId },
      data: {
        lockedYield: 0
      }
    })
  ])

  return {
    success: true,
    amount: yieldAmount,
    message: `Unlocked ₦${yieldAmount.toFixed(2)} to wallet`
  }
}

/**
 * Get yield summary for a user
 */
export async function getUserYieldSummary(userId: string) {
  const holdings = await prisma.tokenHolding.findMany({
    where: { userId },
    include: {
      user: true
    }
  })

  const totalLocked = holdings.reduce((sum, h) => sum + h.lockedYield.toNumber(), 0)
  const totalAccumulated = holdings.reduce((sum, h) => sum + h.accumulatedYield.toNumber(), 0)
  const monthlyYield = holdings.reduce((sum, h) => sum + h.monthlyYieldAmount.toNumber(), 0)

  return {
    totalLockedYield: totalLocked,
    totalAccumulatedYield: totalAccumulated,
    monthlyYieldAmount: monthlyYield,
    holdings: holdings.map(h => ({
      tokenId: h.tokenId,
      invested: h.totalInvested.toNumber(),
      lockedYield: h.lockedYield.toNumber(),
      monthlyYield: h.monthlyYieldAmount.toNumber(),
      maturityDate: h.maturityDate,
      isMatured: h.maturityDate ? new Date() > h.maturityDate : false
    }))
  }
}
