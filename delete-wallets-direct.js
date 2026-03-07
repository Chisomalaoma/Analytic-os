// Direct PostgreSQL script to delete all wallets
const { Client } = require('pg')

const DATABASE_URL = "postgresql://neondb_owner:npg_LlyQd0UITs4q@ep-rapid-paper-a4sa9e19-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

async function deleteAllWallets() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    // Count wallets before deletion
    const walletCountResult = await client.query('SELECT COUNT(*) FROM "Wallet"')
    const walletCount = parseInt(walletCountResult.rows[0].count)
    console.log(`📊 Found ${walletCount} wallets to delete`)

    if (walletCount === 0) {
      console.log('✅ No wallets to delete')
      return
    }

    // Count transactions
    const txCountResult = await client.query('SELECT COUNT(*) FROM "Transaction"')
    const txCount = parseInt(txCountResult.rows[0].count)
    console.log(`📊 Found ${txCount} transactions to delete`)

    console.log('\n⚠️  WARNING: This will delete ALL wallets and transactions!')
    console.log('⚠️  Users will get new wallets on next login with new Monnify account')
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    // Delete all transactions first (foreign key constraint)
    if (txCount > 0) {
      console.log(`🗑️  Deleting ${txCount} transactions...`)
      await client.query('DELETE FROM "Transaction"')
      console.log('✅ Transactions deleted')
    }

    // Delete all wallets
    console.log(`🗑️  Deleting ${walletCount} wallets...`)
    const deleteResult = await client.query('DELETE FROM "Wallet"')
    console.log(`✅ Successfully deleted ${deleteResult.rowCount} wallets`)

    // Clear walletAddress from users
    console.log('🔄 Clearing wallet addresses from user records...')
    const updateResult = await client.query('UPDATE "User" SET "walletAddress" = NULL')
    console.log(`✅ Cleared wallet addresses from ${updateResult.rowCount} users`)

    // Verify deletion
    const verifyResult = await client.query('SELECT COUNT(*) FROM "Wallet"')
    const remainingWallets = parseInt(verifyResult.rows[0].count)
    console.log(`\n✅ Done! Remaining wallets: ${remainingWallets}`)
    console.log('💡 Make sure you updated Monnify credentials in Vercel before users log in!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

deleteAllWallets()
