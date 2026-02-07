// src/components/dashboard/TransactionHistory.tsx

'use client'

import { formatNaira } from '@/lib/utils/wallet'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle, 
  ArrowUpCircle,
  DollarSign
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  formattedAmount: string
  description: string
  reference: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  metadata?: {
    action?: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'dividend'
    tokenSymbol?: string
    quantity?: number
    price?: number
  }
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading?: boolean
}

// Icon component for different transaction types
const TransactionIcon = ({ action, type }: { action?: string; type: 'credit' | 'debit' }) => {
  const iconClass = "w-4 h-4"
  
  if (action === 'buy') {
    return (
      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
        <TrendingUp className={`${iconClass} text-green-500`} />
      </div>
    )
  }
  
  if (action === 'sell') {
    return (
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
        <TrendingDown className={`${iconClass} text-red-500`} />
      </div>
    )
  }
  
  if (action === 'deposit') {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <ArrowDownCircle className={`${iconClass} text-blue-500`} />
      </div>
    )
  }
  
  if (action === 'withdrawal') {
    return (
      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
        <ArrowUpCircle className={`${iconClass} text-orange-500`} />
      </div>
    )
  }

  if (action === 'dividend') {
    return (
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
        <DollarSign className={`${iconClass} text-purple-500`} />
      </div>
    )
  }
  
  // Default based on credit/debit
  if (type === 'credit') {
    return (
      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
        <ArrowDownCircle className={`${iconClass} text-green-500`} />
      </div>
    )
  }
  
  return (
    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
      <ArrowUpCircle className={`${iconClass} text-red-500`} />
    </div>
  )
}

export function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-[#0D0D0D]/50 rounded-lg border border-[#23262F]/50">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#1A1A1A] rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-[#1A1A1A] rounded w-1/2 animate-pulse" />
            </div>
            <div className="h-4 bg-[#1A1A1A] rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-[#0D0D0D]/30 rounded-lg border border-[#23262F]/50">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1A1A1A] flex items-center justify-center">
          <ArrowDownCircle className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-sm text-gray-400">No transactions yet</p>
        <p className="text-xs text-gray-500 mt-1">Your latest portfolio activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx) => {
        const isPositive = tx.type === 'credit'
        const amountColor = isPositive ? 'text-green-400' : 'text-white'
        
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 hover:bg-[#0D0D0D]/50 transition-colors rounded-lg group"
          >
            {/* Icon */}
            <TransactionIcon 
              action={tx.metadata?.action} 
              type={tx.type} 
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm text-white font-medium">
                  {tx.description}
                </p>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-[#1A1A1A] rounded">
                  {tx.metadata?.action || tx.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(tx.createdAt)}
                </span>
                {tx.metadata?.quantity && tx.metadata?.price && (
                  <span className="text-gray-600">
                    {tx.metadata.quantity} × ${tx.metadata.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${amountColor}`}>
                {isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {tx.metadata?.quantity && (
                <p className="text-xs text-gray-500">
                  {tx.metadata.quantity} × ${tx.metadata.price?.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
