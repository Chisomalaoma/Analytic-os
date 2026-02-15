// src/lib/payment-provider.ts
// Unified payment provider interface - supports both Monnify and SafeHaven

import * as monnify from './monnify'
import * as safehaven from './safehaven'
import * as monnifyDisbursement from './monnify-disbursement'

// Determine which provider to use based on environment variable
const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'monnify').toLowerCase()

export type PaymentProvider = 'monnify' | 'safehaven'

export function getPaymentProvider(): PaymentProvider {
  return PAYMENT_PROVIDER as PaymentProvider
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
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to create account`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    return await safehaven.createSubAccount({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      phoneNumber: params.phoneNumber,
      reference: params.reference
    })
  } else {
    // Default to Monnify
    return await monnify.createReservedAccount({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      bvn: params.bvn,
      nin: params.nin,
      reference: params.reference
    })
  }
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
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to get account details`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    // For SafeHaven, accountReference is the account number
    return await safehaven.getSubAccountDetails(accountReference)
  } else {
    // Default to Monnify
    return await monnify.getReservedAccountDetails(accountReference)
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountNumber: string): Promise<number> {
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to get balance`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    return await safehaven.getAccountBalance(accountNumber)
  } else {
    // Monnify doesn't have a direct balance API, return 0
    // Balance is tracked in our database via webhooks
    return 0
  }
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
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to get transactions`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    return await safehaven.getTransactionHistory({
      accountNumber: params.accountNumber,
      startDate: params.startDate || params.fromDate,
      endDate: params.endDate || params.toDate,
      page: params.page,
      pageSize: params.pageSize
    })
  } else {
    // Default to Monnify
    const transactions = await monnify.searchTransactions({
      accountNumber: params.accountNumber,
      fromDate: params.fromDate || params.startDate || '',
      toDate: params.toDate || params.endDate || ''
    })
    return transactions
  }
}

/**
 * Verify bank account for withdrawal
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName: string; accountNumber: string }> {
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to verify bank account`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    return await safehaven.verifyBankAccount(accountNumber, bankCode)
  } else {
    // Default to Monnify
    return await monnifyDisbursement.verifyBankAccount(accountNumber, bankCode)
  }
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
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to initiate withdrawal`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    if (!params.sourceAccountNumber) {
      throw new Error('Source account number is required for SafeHaven transfers')
    }
    return await safehaven.initiateTransfer(
      params.accountNumber,
      params.accountName,
      params.bankCode,
      params.amount,
      params.narration,
      params.reference,
      params.sourceAccountNumber
    )
  } else {
    // Default to Monnify
    return await monnifyDisbursement.initiateDisbursement(
      params.accountNumber,
      params.accountName,
      params.bankCode,
      params.amount,
      params.narration,
      params.reference
    )
  }
}

/**
 * Get withdrawal/transfer status
 */
export async function getWithdrawalStatus(
  transactionReference: string
): Promise<{ status: string; amount: number }> {
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to get withdrawal status`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    return await safehaven.getTransferStatus(transactionReference)
  } else {
    // Default to Monnify
    return await monnifyDisbursement.getDisbursementStatus(transactionReference)
  }
}

/**
 * Get transaction status (for deposits)
 */
export async function getTransactionStatus(reference: string): Promise<{
  status: string
  amount: number
  paidBy: string
}> {
  console.log(`[PAYMENT-PROVIDER] Using ${PAYMENT_PROVIDER} to get transaction status`)

  if (PAYMENT_PROVIDER === 'safehaven') {
    const result = await safehaven.getTransferStatus(reference)
    return {
      status: result.status,
      amount: result.amount,
      paidBy: '' // SafeHaven doesn't provide this in the same way
    }
  } else {
    // Default to Monnify
    return await monnify.getTransactionStatus(reference)
  }
}
