const { PrismaClient } = require('./src/generated/prisma')
const prisma = new PrismaClient()

async function listAllUsers() {
  try {
    console.log('\n📋 Fetching all users from database...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        userId: true,
        firstName: true,
        lastName: true,
        companyName: true,
        phone: true,
        role: true,
        bvn: true,
        nin: true,
        emailVerified: true,
        createdAt: true,
        wallet: {
          select: {
            accountNumber: true,
            bankName: true,
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${users.length} users:\n`)
    console.log('='.repeat(100))

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   User ID: ${user.userId || 'Not set'}`)
      console.log(`   Username: ${user.username || 'Not set'}`)
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`)
      if (user.companyName) {
        console.log(`   Company: ${user.companyName}`)
      }
      console.log(`   Phone: ${user.phone || 'Not set'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   BVN: ${user.bvn || 'Not set'}`)
      console.log(`   NIN: ${user.nin || 'Not set'}`)
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)
      console.log(`   Has Wallet: ${user.wallet ? 'Yes' : 'No'}`)
      if (user.wallet) {
        console.log(`   Account: ${user.wallet.accountNumber} (${user.wallet.bankName})`)
        console.log(`   Balance: ₦${(user.wallet.balance / 100).toFixed(2)}`)
      }
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log('-'.repeat(100))
    })

    console.log(`\n✅ Total users: ${users.length}`)
    console.log(`   With wallets: ${users.filter(u => u.wallet).length}`)
    console.log(`   With BVN: ${users.filter(u => u.bvn).length}`)
    console.log(`   With NIN: ${users.filter(u => u.nin).length}`)
    console.log(`   Email verified: ${users.filter(u => u.emailVerified).length}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllUsers()
