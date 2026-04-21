'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ExchangeRateData {
  rate: number
  lastUpdated: string
  displayRate: string
}

interface CurrencyContextType {
  currency: 'NGN' | 'USD'
  exchangeRate: ExchangeRateData | null
  loading: boolean
  error: string | null
  setCurrency: (currency: 'NGN' | 'USD') => void
  convertAmount: (amount: number) => number
  formatAmount: (amount: number, decimals?: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currencyPreference') as 'NGN' | 'USD'
    if (savedCurrency && ['NGN', 'USD'].includes(savedCurrency)) {
      setCurrency(savedCurrency)
    }
  }, [])

  // Fetch exchange rate when currency changes to USD
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'NGN') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/currency/exchange-rate')
        const data = await response.json()

        if (data.success) {
          setExchangeRate(data.data)
        } else {
          setError('Failed to fetch exchange rate')
        }
      } catch (err) {
        setError('Network error')
        console.error('Exchange rate fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRate()

    // Refresh exchange rate every hour
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currency])

  /**
   * Convert amount from NGN to selected currency
   */
  const convertAmount = (amountInNGN: number): number => {
    if (currency === 'NGN') {
      return amountInNGN
    }

    if (!exchangeRate) {
      return 0
    }

    return amountInNGN * exchangeRate.rate
  }

  /**
   * Format amount with currency symbol
   */
  const formatAmount = (amountInNGN: number, decimals: number = 0): string => {
    if (currency === 'NGN') {
      return `₦${amountInNGN.toLocaleString('en-NG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}`
    }

    const usdAmount = convertAmount(amountInNGN)
    return `$${usdAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`
  }

  const value: CurrencyContextType = {
    currency,
    exchangeRate,
    loading,
    error,
    setCurrency,
    convertAmount,
    formatAmount
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
