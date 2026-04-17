import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function createWallet() {
  const email = 'chisomalaoma@gmail.com'

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true }
    })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    if (user.wallet) {
      console.log(`✅ User already has a wallet`)
      console.log(`   Account Number: ${user.wallet.accountNumber}`)
      console.log(`   Bank: ${user.wallet.bankName}`)
      console.log(`   Account Name: ${user.wallet.accountName}`)
      process.exit(0)
    }

    console.log(`📝 User details:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   First Name: ${user.firstName}`)
    console.log(`   Last Name: ${user.lastName}`)
    console.log(`   NIN: ${user.nin}`)
    console.log(`   BVN: ${user.bvn}`)
    
    if (!user.nin && !user.bvn) {
      console.error(`❌ User has no NIN or BVN. Cannot create wallet.`)
      process.exit(1)
    }

    console.log(`\n✅ User has ${user.nin ? 'NIN' : 'BVN'}. Wallet can be created.`)
    console.log(`   User should sign in and the wallet will be created automatically.`)
    console.log(`   Or click "Create Wallet" button in the dashboard.`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createWallet()
