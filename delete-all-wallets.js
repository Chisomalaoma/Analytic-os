// Script to delete all wallets from database
// Users will get new wallets created automatically on next login with new Monnify account

const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function deleteAllWallets() {
  try {
    console.log('🗑️  Starting wallet deletion...')
    
    // Count wallets before deletion
    const walletCount = await prisma.wallet.count()
    console.log(`📊 Found ${walletCount} wallets to delete`)
    
    if (walletCount === 0) {
      console.log('✅ No wallets to delete')
      return
    }
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL wallets!')
    console.log('⚠️  Users will get new wallets on next login with new Monnify account')
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Delete all transactions first (foreign key constraint)
    const transactionCount = await prisma.transaction.count()
    if (transactionCount > 0) {
      console.log(`🗑️  Deleting ${transactionCount} transactions...`)
      await prisma.transaction.deleteMany({})
      console.log('✅ Transactions deleted')
    }
    
    // Delete all wallets
    console.log(`🗑️  Deleting ${walletCount} wallets...`)
    const result = await prisma.wallet.deleteMany({})
    console.log(`✅ Successfully deleted ${result.count} wallets`)
    
    // Also clear walletAddress from users
    console.log('🔄 Clearing wallet addresses from user records...')
    await prisma.user.updateMany({
      data: {
        walletAddress: null
      }
    })
    console.log('✅ User wallet addresses cleared')
    
    console.log('\n✅ Done! Users will get new wallets on next login.')
    console.log('💡 Make sure you updated Monnify credentials in Vercel before users log in!')
    
  } catch (error) {
    console.error('❌ Error deleting wallets:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllWallets()
