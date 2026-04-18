// src/lib/payment-provider.ts
// Payment provider interface - uses Monnify only

import * as monnify from './monnify'
import * as monnifyDisbursement from './monnify-disbursement'

export type PaymentProvider = 'monnify'

export function getPaymentProvider(): PaymentProvider {
  return 'monnify'
}

export interface PaymentAccount {
  accountNumber: string
  bankName: string
  accountName: string
  accountReference: string
}

export interface TransactionHistory {
  reference: string
  amount: number
  type?: 'credit' | 'debit'
  description?: string
  date?: string
  paidBy?: string
  paymentDate?: string
}

/**
 * Create virtual/reserved account for user
 */
export async function createVirtualAccount(params: {
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  bvn?: string
  nin?: string
  reference: string
}): Promise<PaymentAccount> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to create account')

  return await monnify.createReservedAccount({
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    bvn: params.bvn,
    nin: params.nin,
    reference: params.reference
  })
}

/**
 * Get account details
 */
export async function getAccountDetails(accountReference: string): Promise<{
  exists: boolean
  accountNumber?: string
  bankName?: string
  accountName?: string
  status?: string
  balance?: number
}> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to get account details')
  return await monnify.getReservedAccountDetails(accountReference)
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountNumber: string): Promise<number> {
  console.log('[PAYMENT-PROVIDER] Monnify does not have direct balance API')
  // Monnify doesn't have a direct balance API, return 0
  // Balance is tracked in our database via webhooks
  return 0
}

/**
 * Search/get transaction history
 */
export async function getTransactionHistory(params: {
  accountNumber: string
  fromDate?: string
  toDate?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<TransactionHistory[]> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to get transactions')

  const transactions = await monnify.searchTransactions({
    accountNumber: params.accountNumber,
    fromDate: params.fromDate || params.startDate || '',
    toDate: params.toDate || params.endDate || ''
  })
  return transactions
}

/**
 * Verify bank account for withdrawal
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName: string; accountNumber: string }> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to verify bank account')
  return await monnifyDisbursement.verifyBankAccount(accountNumber, bankCode)
}

/**
 * Initiate withdrawal/transfer
 * @param amount - Amount in kobo
 */
export async function initiateWithdrawal(params: {
  accountNumber: string
  accountName: string
  bankCode: string
  amount: number // in kobo
  narration: string
  reference: string
  sourceAccountNumber?: string
}): Promise<{ transactionReference: string; status: string }> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to initiate withdrawal')

  return await monnifyDisbursement.initiateDisbursement(
    params.accountNumber,
    params.accountName,
    params.bankCode,
    params.amount,
    params.narration,
    params.reference
  )
}

/**
 * Get withdrawal/transfer status
 */
export async function getWithdrawalStatus(
  transactionReference: string
): Promise<{ status: string; amount: number }> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to get withdrawal status')
  return await monnifyDisbursement.getDisbursementStatus(transactionReference)
}

/**
 * Get transaction status (for deposits)
 */
export async function getTransactionStatus(reference: string): Promise<{
  status: string
  amount: number
  paidBy: string
}> {
  console.log('[PAYMENT-PROVIDER] Using Monnify to get transaction status')
  return await monnify.getTransactionStatus(reference)
}
