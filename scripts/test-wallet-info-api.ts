// Test the wallet info API to see what account name it returns

async function testWalletInfoAPI() {
  try {
    console.log('=== TESTING WALLET INFO API ===\n')
    
    // This would normally require authentication, but let's check the logic
    // by directly calling the database query
    
    const { prisma } = await import('../src/lib/prisma')
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId: 'cmnhvct1j0000ji04cwt2jkaz' }, // Chisom's ID
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    })

    if (!wallet) {
      console.log('No wallet found')
      return
    }

    console.log('Database wallet data:')
    console.log(`  Account Number: ${wallet.accountNumber}`)
    console.log(`  Bank Name: ${wallet.bankName}`)
    console.log(`  Stored Account Name: ${wallet.accountName}`)
    console.log('')

    console.log('User data:')
    console.log(`  First Name: ${wallet.user.firstName}`)
    console.log(`  Last Name: ${wallet.user.lastName}`)
    console.log(`  Username: ${wallet.user.username}`)
    console.log('')

    // Apply the same logic as the API
    const firstName = wallet.user.firstName || wallet.user.username || 'User'
    const lastName = wallet.user.lastName || wallet.user.username || 'User'
    const fullName = `XTes - ${firstName} ${lastName}`

    console.log('API should return:')
    console.log(`  Account Name: ${fullName}`)
    console.log('')

    console.log('Expected vs Actual:')
    console.log(`  Expected: XTes - Chisom Alaoma`)
    console.log(`  API Returns: ${fullName}`)
    console.log(`  Database Has: ${wallet.accountName}`)

    await prisma.$disconnect()

  } catch (error) {
    console.error('Error:', error)
  }
}

testWalletInfoAPI()