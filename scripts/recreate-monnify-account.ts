import { prisma } from '../src/lib/prisma'
import { createReservedAccount } from '../src/lib/monnify'

async function recreateMonnifyAccount() {
  try {
    console.log('=== RECREATING MONNIFY ACCOUNT WITH CORRECT NAME ===\n')

    // Get Chisom's user data
    const user = await prisma.user.findUnique({
      where: { email: 'chisomalaoma@gmail.com' },
      include: { wallet: true }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log(`User: ${user.firstName} ${user.lastName}`)
    console.log(`Email: ${user.email}`)

    if (!user.wallet) {
      console.log('No wallet found')
      return
    }

    console.log(`Current account: ${user.wallet.accountNumber}`)
    console.log(`Current name: ${user.wallet.accountName}`)

    // Create new Monnify account with correct name format
    console.log('\nCreating new Monnify account...')
    
    const newAccount = await createReservedAccount({
      email: user.email,
      firstName: user.firstName || 'Chisom',
      lastName: user.lastName || 'Alaoma',
      reference: `WALLET_${user.id}_${Date.now()}_NEW`
    })

    console.log('\n✅ New account created:')
    console.log(`Account Number: ${newAccount.accountNumber}`)
    console.log(`Bank Name: ${newAccount.bankName}`)
    console.log(`Account Name: ${newAccount.accountName}`)
    console.log(`Reference: ${newAccount.accountReference}`)

    // Update wallet with new account details
    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: {
        accountNumber: newAccount.accountNumber,
        bankName: newAccount.bankName,
        accountName: newAccount.accountName,
        accountRef: newAccount.accountReference
      }
    })

    console.log('\n✅ Wallet updated in database')
    console.log('\n🎉 DONE! New account name should show as:', newAccount.accountName)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recreateMonnifyAccount()