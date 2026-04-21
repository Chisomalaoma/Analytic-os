import { prisma } from '../src/lib/prisma'

async function forceWalletRefresh() {
  try {
    console.log('=== FORCING WALLET REFRESH ===\n')

    // Update the wallet's updatedAt timestamp to force cache refresh
    const wallet = await prisma.wallet.update({
      where: { userId: 'cmnhvct1j0000ji04cwt2jkaz' },
      data: {
        updatedAt: new Date()
      }
    })

    console.log('✅ Wallet timestamp updated')
    console.log('This should force the frontend to refresh wallet data')
    console.log('')
    console.log('The API will now return: "XTes - Chisom Alaoma"')
    console.log('Instead of the old: "CHI" or "Xtes Limited-Chi"')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceWalletRefresh()