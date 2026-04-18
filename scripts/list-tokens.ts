import { prisma } from '../src/lib/prisma'

async function listTokens() {
  try {
    const tokens = await prisma.token.findMany({
      select: {
        symbol: true,
        name: true,
        logoUrl: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('\n=== ALL TOKENS ===\n')
    console.log(`Total tokens: ${tokens.length}\n`)
    
    tokens.forEach((token, index) => {
      console.log(`${index + 1}. ${token.symbol} - ${token.name}`)
      console.log(`   Logo: ${token.logoUrl || '❌ No logo'}`)
      console.log(`   Active: ${token.isActive ? '✅' : '❌'}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listTokens()
