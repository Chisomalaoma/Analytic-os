const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function createWallet() {
  try {
    const email = 'chisomalaoma@wtxonline.com'
    
    console.log(`\n🔍 Finding user: ${email}`)
    
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
      nin: user.nin,
      bvn: user.bvn,
      hasWallet: !!user.wallet
    })

    if (user.wallet) {
      console.log('\n✅ User already has a wallet:')
      console.log('   Account Number:', user.wallet.accountNumber)
      console.log('   Bank Name:', user.wallet.bankName)
      console.log('   Account Name:', user.wallet.accountName)
      return
    }

    if (!user.nin && !user.bvn) {
      console.error('\n❌ User needs BVN or NIN to create wallet')
      return
    }

    console.log('\n💰 User has NIN/BVN. Wallet will be created on next login or when they access wallet page.')
    console.log('   The wallet creation happens automatically via the /api/wallet/ensure endpoint')
    console.log('\n✅ NIN is set. User can now create wallet!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createWallet()
