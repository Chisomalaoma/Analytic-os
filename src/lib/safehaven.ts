// src/lib/safehaven.ts
// SafeHaven MFB API Integration

const SAFEHAVEN_BASE_URL = process.env.SAFEHAVEN_BASE_URL || 'https://api.sandbox.safehavenmfb.com'
const SAFEHAVEN_CLIENT_ID = process.env.SAFEHAVEN_CLIENT_ID
const SAFEHAVEN_CLIENT_SECRET = process.env.SAFEHAVEN_CLIENT_SECRET
const SAFEHAVEN_ACCOUNT_ID = process.env.SAFEHAVEN_ACCOUNT_ID

export interface SafeHavenConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  accountId: string
}

export const SAFEHAVEN_CONFIG: SafeHavenConfig = {
  baseUrl: SAFEHAVEN_BASE_URL,
  clientId: SAFEHAVEN_CLIENT_ID || '',
  clientSecret: SAFEHAVEN_CLIENT_SECRET || '',
  accountId: SAFEHAVEN_ACCOUNT_ID || ''
}

let accessToken: string | null = null
let tokenExpiresAt: number = 0

/**
 * Get OAuth access token using client credentials
 */
async function getAuthToken(): Promise<{ token: string; expiresAt: number }> {
  // Return cached token if still valid (with 60s buffer)
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return { token: accessToken, expiresAt: tokenExpiresAt }
  }

  const authUrl = `${SAFEHAVEN_CONFIG.baseUrl}/oauth2/token`

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SAFEHAVEN_CONFIG.clientId,
      client_secret: SAFEHAVEN_CONFIG.clientSecret
    })
  })

  const responseText = await response.text()
  let responseData

  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`SafeHaven auth failed (${response.status}): ${responseText}`)
  }

  if (!response.ok) {
    const errorMsg = responseData?.error_description || responseData?.message || 'Unknown error'
    throw new Error(`SafeHaven authentication failed (${response.status}): ${errorMsg}`)
  }

  accessToken = responseData.access_token
  tokenExpiresAt = Date.now() + (responseData.expires_in * 1000)

  return {
    token: accessToken,
    expiresAt: tokenExpiresAt
  }
}

/**
 * Create sub-account (virtual account) for user
 */
export async function createSubAccount(params: {
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  reference: string
}): Promise<{
  accountNumber: string
  bankName: string
  accountName: string
  accountReference: string
}> {
  const { token } = await getAuthToken()

  // Validate required fields
  if (!params.email || !params.email.trim()) {
    throw new Error('Email must not be blank')
  }
  if (!params.firstName || !params.firstName.trim()) {
    throw new Error('First name must not be blank')
  }
  if (!params.lastName || !params.lastName.trim()) {
    throw new Error('Last name must not be blank')
  }

  const accountName = `${params.firstName.trim()} ${params.lastName.trim()}`

  const requestBody = {
    accountName: accountName,
    emailAddress: params.email.trim(),
    phoneNumber: params.phoneNumber || '',
    externalReference: params.reference,
    parentAccountId: SAFEHAVEN_CONFIG.accountId
  }

  const response = await fetch(`${SAFEHAVEN_CONFIG.baseUrl}/accounts/sub-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'ClientID': SAFEHAVEN_CONFIG.clientId
    },
    body: JSON.stringify(requestBody)
  })

  const responseText = await response.text()
  let responseData

  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Failed to create sub-account (${response.status}): ${responseText}`)
  }

  if (!response.ok || !responseData.successful) {
    const errorMsg = responseData?.message || responseData?.error || JSON.stringify(responseData)
    throw new Error(errorMsg)
  }

  const account = responseData.data

  return {
    accountNumber: account.accountNumber,
    bankName: account.bankName || 'Safe Haven MFB',
    accountName: account.accountName,
    accountReference: account.externalReference || params.reference
  }
}

/**
 * Get sub-account details by account number
 */
export async function getSubAccountDetails(accountNumber: string): Promise<{
  exists: boolean
  accountNumber?: string
  bankName?: string
  accountName?: string
  balance?: number
}> {
  try {
    const { token } = await getAuthToken()

    const response = await fetch(
      `${SAFEHAVEN_CONFIG.baseUrl}/accounts/${accountNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'ClientID': SAFEHAVEN_CONFIG.clientId
        }
      }
    )

    const responseText = await response.text()
    console.log('Get Sub-Account Response:', responseText)

    if (!response.ok) {
      return { exists: false }
    }

    const data = JSON.parse(responseText)
    if (!data.successful) {
      return { exists: false }
    }

    const account = data.data
    return {
      exists: true,
      accountNumber: account.accountNumber,
      bankName: account.bankName || 'Safe Haven MFB',
      accountName: account.accountName,
      balance: account.availableBalance ? Math.round(account.availableBalance * 100) : 0 // Convert to kobo
    }
  } catch (error) {
    console.error('Error checking sub-account:', error)
    return { exists: false }
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountNumber: string): Promise<number> {
  const { token } = await getAuthToken()

  const response = await fetch(
    `${SAFEHAVEN_CONFIG.baseUrl}/accounts/${accountNumber}/balance`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'ClientID': SAFEHAVEN_CONFIG.clientId
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get account balance')
  }

  const data = await response.json()
  
  if (!data.successful) {
    throw new Error(data.message || 'Failed to get balance')
  }

  // Return balance in kobo
  return Math.round((data.data.availableBalance || 0) * 100)
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(params: {
  accountNumber: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<Array<{
  reference: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  date: string
  status: string
}>> {
  const { token } = await getAuthToken()

  const queryParams = new URLSearchParams({
    accountNumber: params.accountNumber,
    page: (params.page || 1).toString(),
    pageSize: (params.pageSize || 50).toString()
  })

  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)

  const response = await fetch(
    `${SAFEHAVEN_CONFIG.baseUrl}/transactions?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'ClientID': SAFEHAVEN_CONFIG.clientId
      }
    }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  
  if (!data.successful || !data.data) {
    return []
  }

  return data.data.map((tx: any) => ({
    reference: tx.reference || tx.transactionReference,
    amount: Math.round((tx.amount || 0) * 100), // Convert to kobo
    type: tx.type === 'Credit' ? 'credit' : 'debit',
    description: tx.narration || tx.description || '',
    date: tx.transactionDate || tx.createdAt,
    status: tx.status || 'completed'
  }))
}

/**
 * Verify bank account details
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName: string; accountNumber: string }> {
  const { token } = await getAuthToken()

  const response = await fetch(
    `${SAFEHAVEN_CONFIG.baseUrl}/transfers/name-enquiry`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ClientID': SAFEHAVEN_CONFIG.clientId
      },
      body: JSON.stringify({
        accountNumber,
        bankCode
      })
    }
  )

  if (!response.ok) {
    throw new Error('Failed to verify bank account')
  }

  const data = await response.json()
  
  if (!data.successful) {
    throw new Error(data.message || 'Account verification failed')
  }

  return {
    accountName: data.data.accountName,
    accountNumber: data.data.accountNumber
  }
}

/**
 * Initiate transfer (withdrawal)
 * @param amount - Amount in kobo (will be converted to NGN)
 */
export async function initiateTransfer(
  accountNumber: string,
  accountName: string,
  bankCode: string,
  amount: number, // in kobo
  narration: string,
  reference: string,
  sourceAccountNumber: string
): Promise<{ transactionReference: string; status: string }> {
  const { token } = await getAuthToken()

  // Convert kobo to NGN
  const amountInNGN = amount / 100

  const response = await fetch(
    `${SAFEHAVEN_CONFIG.baseUrl}/transfers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ClientID': SAFEHAVEN_CONFIG.clientId
      },
      body: JSON.stringify({
        nameEnquiryReference: reference,
        debitAccountNumber: sourceAccountNumber,
        beneficiaryAccountNumber: accountNumber,
        beneficiaryAccountName: accountName,
        beneficiaryBankCode: bankCode,
        amount: amountInNGN,
        narration,
        paymentReference: reference
      })
    }
  )

  const data = await response.json()

  if (!response.ok || !data.successful) {
    const errorMsg = data.message || 'Transfer failed'
    throw new Error(errorMsg)
  }

  return {
    transactionReference: data.data.transactionReference || reference,
    status: data.data.status || 'pending'
  }
}

/**
 * Get transfer status
 */
export async function getTransferStatus(
  transactionReference: string
): Promise<{ status: string; amount: number }> {
  const { token } = await getAuthToken()

  const response = await fetch(
    `${SAFEHAVEN_CONFIG.baseUrl}/transfers/${transactionReference}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'ClientID': SAFEHAVEN_CONFIG.clientId
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get transfer status')
  }

  const data = await response.json()
  
  if (!data.successful) {
    throw new Error(data.message || 'Failed to get status')
  }

  return {
    status: data.data.status || 'unknown',
    amount: Math.round((data.data.amount || 0) * 100) // Convert to kobo
  }
}
