// src/lib/notifications.ts
import { prisma } from '@/lib/prisma'

type NotificationType = 'alert' | 'transaction'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata
}: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isRead: false
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

/**
 * Create notification for wallet deposit
 */
export async function notifyWalletDeposit(userId: string, amount: number, reference: string) {
  const nairaAmount = (amount / 100).toLocaleString('en-NG')
  await createNotification({
    userId,
    type: 'transaction',
    title: 'Wallet Funded Successfully',
    message: `Your wallet has been credited with ₦${nairaAmount} via bank transfer.`,
    metadata: { amount, reference, action: 'deposit' }
  })
}

/**
 * Create notification for token purchase
 */
export async function notifyTokenPurchase(
  userId: string,
  tokenSymbol: string,
  tokensReceived: number,
  amountSpent: number
) {
  const nairaAmount = amountSpent.toLocaleString('en-NG')
  await createNotification({
    userId,
    type: 'transaction',
    title: 'Token Purchase Successful',
    message: `You successfully purchased ${tokensReceived} units of ${tokenSymbol} for ₦${nairaAmount}.`,
    metadata: { tokenSymbol, tokensReceived, amountSpent, action: 'buy' }
  })
}

/**
 * Create notification for token sale
 */
export async function notifyTokenSale(
  userId: string,
  tokenSymbol: string,
  tokensSold: number,
  amountReceived: number
) {
  const nairaAmount = amountReceived.toLocaleString('en-NG')
  await createNotification({
    userId,
    type: 'transaction',
    title: 'Token Sale Successful',
    message: `You successfully sold ${tokensSold} units of ${tokenSymbol} for ₦${nairaAmount}.`,
    metadata: { tokenSymbol, tokensSold, amountReceived, action: 'sell' }
  })
}

/**
 * Create notification for withdrawal
 */
export async function notifyWithdrawal(
  userId: string,
  amount: number,
  accountNumber: string,
  status: 'initiated' | 'completed' | 'failed'
) {
  const nairaAmount = (amount / 100).toLocaleString('en-NG')
  const maskedAccount = `****${accountNumber.slice(-4)}`
  
  const titles = {
    initiated: 'Withdrawal Initiated',
    completed: 'Withdrawal Completed',
    failed: 'Withdrawal Failed'
  }
  
  const messages = {
    initiated: `Your withdrawal of ₦${nairaAmount} to ${maskedAccount} is being processed.`,
    completed: `Your withdrawal of ₦${nairaAmount} to ${maskedAccount} has been completed.`,
    failed: `Your withdrawal of ₦${nairaAmount} to ${maskedAccount} failed. Please contact support.`
  }
  
  await createNotification({
    userId,
    type: 'transaction',
    title: titles[status],
    message: messages[status],
    metadata: { amount, accountNumber: maskedAccount, status, action: 'withdrawal' }
  })
}

/**
 * Create notification for admin actions
 */
export async function notifyAdminAction(
  userId: string,
  action: string,
  details: string
) {
  await createNotification({
    userId,
    type: 'alert',
    title: `Admin Action: ${action}`,
    message: details,
    metadata: { action, type: 'admin' }
  })
}

/**
 * Create notification for security alerts
 */
export async function notifySecurityAlert(userId: string, message: string) {
  await createNotification({
    userId,
    type: 'alert',
    title: 'Security Alert',
    message,
    metadata: { type: 'security' }
  })
}

/**
 * Create notification for yield/earnings
 */
export async function notifyYield(
  userId: string,
  tokenSymbol: string,
  yieldAmount: number,
  newBalance: number
) {
  await createNotification({
    userId,
    type: 'transaction',
    title: 'Yield Earned',
    message: `You earned ₦${yieldAmount.toLocaleString()} in yield from your ${tokenSymbol} investment. New balance: ₦${newBalance.toLocaleString()}`,
    metadata: { tokenSymbol, yieldAmount, newBalance, type: 'yield' }
  })
}

/**
 * Create notification when a new token is listed
 */
export async function notifyNewTokenListed(
  userId: string,
  tokenName: string,
  tokenSymbol: string,
  price: number,
  annualYield: number
) {
  await createNotification({
    userId,
    type: 'alert',
    title: 'New Token Available',
    message: `${tokenName} (${tokenSymbol}) is now available! Price: ₦${price.toLocaleString()}, Annual Yield: ${annualYield}%`,
    metadata: { tokenName, tokenSymbol, price, annualYield, action: 'new_listing' }
  })
}

/**
 * Create notification when admin updates a token
 */
export async function notifyTokenUpdate(
  userId: string,
  tokenSymbol: string,
  updateType: 'price' | 'yield' | 'status',
  oldValue: string | number,
  newValue: string | number
) {
  const messages = {
    price: `Price changed from ₦${Number(oldValue).toLocaleString()} to ₦${Number(newValue).toLocaleString()}`,
    yield: `Annual yield changed from ${oldValue}% to ${newValue}%`,
    status: (typeof newValue === 'boolean' && newValue) || newValue === 'active' || newValue === 1
      ? 'Token is now active and available for trading'
      : 'Token has been deactivated and is no longer available'
  }

  await createNotification({
    userId,
    type: 'alert',
    title: `${tokenSymbol} Token Updated`,
    message: messages[updateType],
    metadata: { tokenSymbol, updateType, oldValue, newValue, action: 'price_alert' }
  })
}

/**
 * Create notification when admin deletes a token
 */
export async function notifyTokenDeleted(
  userId: string,
  tokenSymbol: string,
  reason?: string
) {
  await createNotification({
    userId,
    type: 'alert',
    title: `${tokenSymbol} Token Removed`,
    message: reason || `The ${tokenSymbol} token has been removed from the platform. Any holdings will be preserved.`,
    metadata: { tokenSymbol, reason, type: 'token_deleted' }
  })
}
