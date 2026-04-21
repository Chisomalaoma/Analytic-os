import { prisma } from '../src/lib/prisma'

async function fixExistingYields() {
  try {
    console.log('=== FIXING EXISTING YIELDS ===\n')

    // Get all holdings that have 0 locked yield but should have yield
    const holdings = await prisma.tokenHolding.findMany({
      where: {
        lockedYield: 0,
        totalInvested: { gt: 0 }
      }
    })

    console.log(`Found ${holdings.length} holdings to fix\n`)

    for (const holding of holdings) {
      const monthlyYield = Number(holding.monthlyYieldAmount)
      
      if (monthlyYield > 0) {
        console.log(`Fixing ${holding.tokenId} for user ${holding.userId}:`)
        console.log(`  Investment: ₦${Number(holding.totalInvested)}`)
        console.log(`  Monthly Yield: ₦${monthlyYield}`)
        console.log(`  Crediting ₦${monthlyYield} to locked yield...`)

        await prisma.tokenHolding.update({
          where: { id: holding.id },
          data: {
            lockedYield: monthlyYield,
            accumulatedYield: monthlyYield
          }
        })

        console.log(`  ✅ Fixed!\n`)
      }
    }

    console.log('=== DONE ===')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingYields()