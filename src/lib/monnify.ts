// src/lib/monnify.ts

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com'
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE
const MONNIFY_SOURCE_ACCOUNT = process.env.MONNIFY_SOURCE_ACCOUNT // Your Monnify wallet for disbursements

export interface MonnifyConfig {
  baseUrl: string
  apiKey: string
  secretKey: string
  contractCode: string
  sourceAccountNumber: string
}

export const MONNIFY_CONFIG: MonnifyConfig = {
  baseUrl: MONNIFY_BASE_URL,
  apiKey: MONNIFY_API_KEY || '',
  secretKey: MONNIFY_SECRET_KEY || '',
  contractCode: MONNIFY_CONTRACT_CODE || '',
  sourceAccountNumber: MONNIFY_SOURCE_ACCOUNT || ''
}

const config: MonnifyConfig = MONNIFY_CONFIG

// Get authentication token using Basic Auth
async function getAuthToken(): Promise<{ token: string; expiresAt: number }> {
  const authUrl = `${config.baseUrl}/api/v1/auth/login`

  // Monnify requires Basic Auth with apiKey:secretKey encoded in base64
  const credentials = Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: '{}' // Empty body for Basic Auth
  })

  const responseText = await response.text()
  let responseData

  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Monnify auth failed (${response.status}): ${responseText}`)
  }

  if (!response.ok) {
    const errorMsg = responseData?.responseMessage || responseData?.message || responseData?.error || 'Unknown error'
    const errorInfo = responseData?.errors ? JSON.stringify(responseData.errors) : ''
    throw new Error(`Monnify authentication failed (${response.status}): ${errorMsg} ${errorInfo}`)
  }

  return {
    token: responseData.responseBody.accessToken,
    expiresAt: Date.now() + responseData.responseBody.expiresIn * 1000
  }
}

// Create reserved account for user
export async function createReservedAccount(params: {
  email: string
  firstName: string
  lastName: string
  bvn?: string
  nin?: string
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

  const customerName = `${params.firstName.trim()} ${params.lastName.trim()}`

  const requestBody: Record<string, unknown> = {
    accountReference: params.reference,
    accountName: customerName,
    currencyCode: 'NGN',
    contractCode: config.contractCode,
    customerEmail: params.email.trim(),
    customerName: customerName,
    getAllAvailableBanks: true
  }

  // Add BVN or NIN if provided (Monnify may require this for some account types)
  // If neither is provided, Monnify will reject - this is expected for OAuth users
  if (!params.bvn && !params.nin) {
    throw new Error('BVN or NIN is required by Monnify to create virtual account. Please complete KYC verification.')
  }
  
  if (params.bvn) {
    requestBody.bvn = params.bvn
  }
  if (params.nin) {
    requestBody.nin = params.nin
  }

  const response = await fetch(`${config.baseUrl}/api/v2/bank-transfer/reserved-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  })

  const responseText = await response.text()

  let responseData
  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Failed to create account (${response.status}): ${responseText}`)
  }

  if (!response.ok || !responseData.requestSuccessful) {
    const errorMsg = responseData.responseMessage || responseData.message || JSON.stringify(responseData)
    throw new Error(errorMsg)
  }

  const account = responseData.responseBody.accounts[0]

  return {
    accountNumber: account.accountNumber,
    bankName: account.bankName,
    accountName: account.accountName,
    accountReference: responseData.responseBody.accountReference
  }
}

// Get reserved account details by reference
export async function getReservedAccountDetails(accountReference: string): Promise<{
  exists: boolean
  accountNumber?: string
  bankName?: string
  accountName?: string
  status?: string
}> {
  try {
    const { token } = await getAuthToken()

    const response = await fetch(
      `${config.baseUrl}/api/v2/bank-transfer/reserved-accounts/${encodeURIComponent(accountReference)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const responseText = await response.text()
    console.log('Get Reserved Account Response:', responseText)

    if (!response.ok) {
      return { exists: false }
    }

    const data = JSON.parse(responseText)
    if (!data.requestSuccessful) {
      return { exists: false }
    }

    const account = data.responseBody.accounts?.[0]
    return {
      exists: true,
      accountNumber: account?.accountNumber,
      bankName: account?.bankName,
      accountName: account?.accountName,
      status: data.responseBody.status
    }
  } catch (error) {
    console.error('Error checking reserved account:', error)
    return { exists: false }
  }
}

// Get transaction status
export async function getTransactionStatus(reference: string): Promise<{
  status: string
  amount: number
  paidBy: string
}> {
  const { token } = await getAuthToken()

  const response = await fetch(`${config.baseUrl}/api/v2/transactions/${reference}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get transaction status')
  }

  const data = await response.json()
  return {
    status: data.responseBody.paymentStatus,
    amount: data.responseBody.amount,
    paidBy: data.responseBody.payerAccountNumber
  }
}

// Search for incoming transactions to account
export async function searchTransactions(params: {
  accountNumber: string
  fromDate: string
  toDate: string
}): Promise<
  Array<{
    reference: string
    amount: number
    paidBy: string
    paymentDate: string
  }>
> {
  const { token } = await getAuthToken()

  const response = await fetch(`${config.baseUrl}/api/v2/transactions/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      accountNumber: params.accountNumber,
      from: params.fromDate,
      to: params.toDate,
      page: 0,
      size: 50
    })
  })

  if (!response.ok) {
    return [] // Return empty array on error
  }

  const data = await response.json()
  return data.responseBody.content.map((tx: any) => ({
    reference: tx.transactionReference,
    amount: Math.round(tx.amount * 100), // Convert to kobo
    paidBy: tx.payerAccountNumber,
    paymentDate: tx.paymentDate
  }))
}
