const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function addNinAndCreateWallet() {
  try {
    const email = 'chisomalaoma@wtxonline.com'
    const nin = '27897918926'

    console.log(`\n🔍 Finding user: ${email}`)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true }
    })

    if (!user) {
      console.error('❌ User not found')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hasWallet: !!user.wallet,
      currentNIN: user.nin,
      currentBVN: user.bvn
    })

    // Update NIN
    console.log(`\n📝 Adding NIN: ${nin}`)
    await prisma.user.update({
      where: { id: user.id },
      data: { nin }
    })
    console.log('✅ NIN added successfully')

    // Delete existing wallet if any (to recreate with NIN)
    if (user.wallet) {
      console.log('\n🗑️  Deleting existing wallet to recreate with NIN...')
      await prisma.wallet.delete({
        where: { id: user.wallet.id }
      })
      console.log('✅ Old wallet deleted')
    }

    // Create wallet with NIN
    console.log('\n💰 Creating wallet with NIN...')
    
    // Import using dynamic import for TypeScript modules
    const walletService = await import('./src/lib/wallet-service.ts')
    const result = await walletService.ensureUserHasWallet(user.id)
    
    if (result.success) {
      console.log('✅ Wallet created successfully!')
      console.log('   Account Number:', result.wallet.accountNumber)
      console.log('   Bank Name:', result.wallet.bankName)
      console.log('   Account Name:', result.wallet.accountName)
    } else {
      console.error('❌ Wallet creation failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

addNinAndCreateWallet()
