import { prisma } from '../src/lib/prisma'

async function checkRecentTransactions() {
  try {
    console.log('=== CHECKING RECENT TRANSACTIONS ===\n')

    // Get Chisom's recent token purchases
    const purchases = await prisma.tokenPurchase.findMany({
      where: {
        userId: 'cmnhvct1j0000ji04cwt2jkaz' // Chisom Alaoma
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`Found ${purchases.length} token purchases:\n`)

    purchases.forEach((purchase, index) => {
      console.log(`${index + 1}. Purchase ID: ${purchase.id}`)
      console.log(`   Date: ${purchase.createdAt.toISOString()}`)
      console.log(`   Token: ${purchase.tokenId}`)
      console.log(`   Amount Spent: ₦${purchase.nairaAmountSpent}`)
      console.log(`   Tokens Received: ${purchase.tokensReceived}`)
      console.log(`   Price Per Token: ₦${purchase.pricePerToken / 100}`)
      console.log(`   Status: ${purchase.status}`)
      console.log('')
    })

    // Check wallet transactions
    const wallet = await prisma.wallet.findUnique({
      where: { userId: 'cmnhvct1j0000ji04cwt2jkaz' }
    })

    if (wallet) {
      const walletTransactions = await prisma.transaction.findMany({
        where: {
          walletId: wallet.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })

      console.log(`Recent wallet transactions:\n`)
      walletTransactions.forEach((tx, index) => {
        console.log(`${index + 1}. Transaction ID: ${tx.id}`)
        console.log(`   Date: ${tx.createdAt.toISOString()}`)
        console.log(`   Type: ${tx.type}`)
        console.log(`   Amount: ₦${tx.amount / 100}`)
        console.log(`   Description: ${tx.description}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentTransactions()