import { prisma } from './prisma'
import { createVirtualAccount, getPaymentProvider } from './payment-provider'

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create wallet with retry logic
 */
export async function createWalletWithRetry(params: {
  userId: string
  email: string
  firstName: string
  lastName: string
  maxRetries?: number
}): Promise<{
  success: boolean
  wallet?: any
  error?: string
}> {
  const { userId, email, firstName, lastName, maxRetries = 3 } = params
  
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[WALLET-SERVICE] Attempt ${attempt}/${maxRetries} to create wallet for ${email}`)
      
      // Check if wallet already exists
      const existingWallet = await prisma.wallet.findUnique({
        where: { userId }
      })
      
      if (existingWallet) {
        console.log(`[WALLET-SERVICE] Wallet already exists for user ${email}`)
        return { success: true, wallet: existingWallet }
      }
      
      // Create virtual account (Monnify or SafeHaven based on env)
      const provider = getPaymentProvider()
      console.log(`[WALLET-SERVICE] Using payment provider: ${provider}`)
      
      const virtualAccount = await createVirtualAccount({
        email,
        firstName,
        lastName,
        reference: `WALLET_${userId}_${Date.now()}`
      })
      
      console.log(`[WALLET-SERVICE] Virtual account created: ${virtualAccount.accountNumber}`)
      
      // Save wallet to database
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          accountNumber: virtualAccount.accountNumber,
          bankName: virtualAccount.bankName,
          accountName: virtualAccount.accountName,
          accountRef: virtualAccount.accountReference,
          balance: 0
        }
      })
      
      console.log(`[WALLET-SERVICE] Wallet created successfully for ${email}`)
      return { success: true, wallet }
      
    } catch (error: any) {
      lastError = error
      console.error(`[WALLET-SERVICE] Attempt ${attempt} failed:`, error.message)
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delayMs = 1000 * attempt // Exponential backoff: 1s, 2s, 3s
        console.log(`[WALLET-SERVICE] Retrying in ${delayMs}ms...`)
        await sleep(delayMs)
      }
    }
  }
  
  // All attempts failed
  console.error(`[WALLET-SERVICE] Failed to create wallet after ${maxRetries} attempts`)
  return {
    success: false,
    error: lastError?.message || 'Failed to create wallet'
  }
}

/**
 * Ensure user has a wallet (create if missing)
 */
export async function ensureUserHasWallet(userId: string): Promise<{
  success: boolean
  error?: string
  wallet?: any
}> {
  try {
    console.log('[WALLET-SERVICE] Ensuring wallet for user:', userId)
    
    // Check if wallet exists
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })
    
    if (wallet) {
      console.log('[WALLET-SERVICE] Wallet already exists')
      return { success: true, wallet }
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true
      }
    })
    
    if (!user) {
      const error = 'User not found'
      console.error('[WALLET-SERVICE]', error, userId)
      return { success: false, error }
    }
    
    console.log('[WALLET-SERVICE] Creating wallet for:', user.email)
    
    // Create wallet
    const firstName = user.firstName || user.username || user.email.split('@')[0]
    const lastName = user.lastName || user.username || user.email.split('@')[0]
    
    const result = await createWalletWithRetry({
      userId,
      email: user.email,
      firstName,
      lastName
    })
    
    if (!result.success) {
      console.error('[WALLET-SERVICE] Wallet creation failed:', result.error)
    }
    
    return result
  } catch (error: any) {
    console.error('[WALLET-SERVICE] Error ensuring wallet:', error)
    console.error('[WALLET-SERVICE] Error stack:', error.stack)
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Credit wallet with transaction
 */
export async function creditWallet(params: {
  walletId: string
  amount: number // in kobo
  description: string
  reference: string
  monnifyRef?: string
}): Promise<{
  success: boolean
  error?: string
  transaction?: any
}> {
  try {
    // Check for duplicate transaction
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { reference: params.reference },
          ...(params.monnifyRef ? [{ monnifyRef: params.monnifyRef }] : [])
        ]
      }
    })

    if (existingTx) {
      console.log(`[WALLET-SERVICE] Duplicate transaction: ${params.reference}`)
      return { success: false, error: 'Duplicate transaction' }
    }

    // Credit wallet and create transaction in a single database transaction
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: params.walletId },
        data: { balance: { increment: params.amount } }
      }),
      prisma.transaction.create({
        data: {
          walletId: params.walletId,
          type: 'credit',
          amount: params.amount,
          description: params.description,
          reference: params.reference,
          monnifyRef: params.monnifyRef,
          status: 'completed'
        }
      })
    ])

    console.log(`[WALLET-SERVICE] Credited ${params.amount} kobo to wallet ${params.walletId}`)
    return { success: true, transaction }
  } catch (error: any) {
    console.error('[WALLET-SERVICE] Error crediting wallet:', error)
    return { success: false, error: error.message || 'Failed to credit wallet' }
  }
}

/**
 * Format kobo to naira for display
 */
export function formatKoboToNaira(kobo: number): string {
  const naira = kobo / 100
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
