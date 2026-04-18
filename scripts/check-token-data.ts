import { prisma } from '../src/lib/prisma'

async function checkTokenData() {
  try {
    const tokens = await prisma.token.findMany({
      select: {
        symbol: true,
        name: true,
        price: true,
        annualYield: true,
        industry: true,
        investmentType: true,
        riskLevel: true,
        payoutFrequency: true,
      },
    })

    console.log('\n=== TOKEN DATA ===\n')
    
    tokens.forEach((token) => {
      console.log(`${token.symbol} - ${token.name}`)
      console.log(`  Price: ₦${token.price / 100}`)
      console.log(`  Annual Yield: ${token.annualYield}%`)
      console.log(`  Industry: ${token.industry}`)
      console.log(`  Investment Type: ${token.investmentType}`)
      console.log(`  Risk Level: ${token.riskLevel}`)
      console.log(`  Payout Frequency: ${token.payoutFrequency}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTokenData()
