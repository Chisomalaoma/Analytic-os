import { prisma } from '../src/lib/prisma'

async function fixTransactionFees() {
  try {
    console.log('=== FIXING TRANSACTION FEES ===\n')

    // Get Chisom's holdings
    const holdings = await prisma.tokenHolding.findMany({
      where: {
        userId: 'cmnhvct1j0000ji04cwt2jkaz' // Chisom Alaoma
      }
    })

    console.log(`Found ${holdings.length} holdings to fix\n`)

    for (const holding of holdings) {
      const originalInvestment = Number(holding.totalInvested)
      const TRANSACTION_FEE_RATE = 0.0035 // 0.35%
      
      // Calculate what the investment should be after fee
      const transactionFee = originalInvestment * TRANSACTION_FEE_RATE
      const investmentAfterFee = originalInvestment - transactionFee
      
      // Calculate new monthly yield based on corrected investment
      const newMonthlyYield = (investmentAfterFee * 0.18) / 12 // 18% APY for RSVT
      
      console.log(`Fixing ${holding.tokenId}:`)
      console.log(`  Original Investment: ₦${originalInvestment}`)
      console.log(`  Transaction Fee (0.35%): ₦${transactionFee.toFixed(2)}`)
      console.log(`  Investment After Fee: ₦${investmentAfterFee.toFixed(2)}`)
      console.log(`  Old Monthly Yield: ₦${Number(holding.monthlyYieldAmount).toFixed(2)}`)
      console.log(`  New Monthly Yield: ₦${newMonthlyYield.toFixed(2)}`)
      
      // Update the holding
      await prisma.tokenHolding.update({
        where: { id: holding.id },
        data: {
          totalInvested: investmentAfterFee,
          monthlyYieldAmount: newMonthlyYield,
          lockedYield: newMonthlyYield, // Reset to new monthly yield
          accumulatedYield: newMonthlyYield
        }
      })
      
      console.log(`  ✅ Updated!\n`)
    }

    console.log('=== DONE ===')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTransactionFees()