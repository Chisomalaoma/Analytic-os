import { prisma } from '../src/lib/prisma'

async function testYieldCalculation() {
  try {
    // Get user's holdings
    const holdings = await prisma.tokenHolding.findMany({
      where: {
        userId: 'cmnhvct1j0000ji04cwt2jkaz' // Chisom Alaoma
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log('\n=== YIELD CALCULATION TEST ===\n')
    
    if (holdings.length === 0) {
      console.log('No holdings found for this user')
      return
    }

    let totalLockedYield = 0

    holdings.forEach((holding, index) => {
      console.log(`${index + 1}. ${holding.tokenId} Holdings:`)
      console.log(`   Total Invested: ₦${Number(holding.totalInvested).toFixed(2)}`)
      console.log(`   Locked Yield: ₦${Number(holding.lockedYield || 0).toFixed(2)}`)
      console.log(`   Monthly Yield Amount: ₦${Number(holding.monthlyYieldAmount || 0).toFixed(2)}`)
      console.log(`   Quantity: ${Number(holding.quantity)} tokens`)
      console.log(`   Average Price: ₦${Number(holding.averagePrice) / 100}`)
      console.log('')

      totalLockedYield += Number(holding.lockedYield || 0)
    })

    console.log(`TOTAL LOCKED YIELD: ₦${totalLockedYield.toFixed(2)}`)
    console.log(`USER: ${holdings[0].user.firstName} ${holdings[0].user.lastName} (${holdings[0].user.email})`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testYieldCalculation()