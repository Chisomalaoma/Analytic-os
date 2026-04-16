// src/hooks/useWallet.ts

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok && res.status === 401) {
    // Return empty data for unauthorized instead of throwing
    return { success: false, data: null }
  }
  return res.json()
})

export function useWallet() {
  const { data: balance, error: balanceError, mutate: mutateBalance } = useSWR(
    '/api/wallet/balance',
    fetcher,
    { 
      refreshInterval: 5000, // Refresh every 5 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const { data: walletData, error: walletError, mutate: mutateWallet } = useSWR(
    '/api/wallet/info',
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const { data: transactions, error: txError, mutate: mutateTx } = useSWR(
    '/api/wallet/transactions',
    fetcher,
    { 
      refreshInterval: 5000, // Refresh every 5 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const createWallet = async () => {
    const res = await fetch('/api/wallet/ensure', { method: 'POST' })
    const data = await res.json()
    
    if (!res.ok) {
      const errorMessage = data.error || data.details || 'Failed to create wallet'
      console.error('[useWallet] Wallet creation failed:', data)
      throw new Error(errorMessage)
    }
    
    await mutateWallet()
    await mutateBalance()
    return data
  }

  const syncWallet = async () => {
    const res = await fetch('/api/wallet/sync', { method: 'GET' })
    if (!res.ok) throw new Error('Failed to sync wallet')
    await mutateBalance()
    await mutateTx()
    return res.json()
  }

  const refreshBalance = async () => {
    await mutateBalance()
    await mutateTx()
  }

  return {
    balance: balance?.data?.balance || 0,
    formattedBalance: balance?.data?.formattedBalance || '₦0.00',
    wallet: walletData?.data?.exists ? walletData.data : null,
    hasWallet: walletData?.data?.exists ?? false,
    transactions: transactions?.data?.transactions || [],
    isLoading: !balance && !balanceError || !walletData && !walletError,
    isError: balanceError || walletError,
    createWallet,
    syncWallet,
    refreshBalance,
    mutateWallet,
    mutateBalance
  }
}
