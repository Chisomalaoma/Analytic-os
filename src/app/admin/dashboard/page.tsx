"use client"

import { useState, useEffect } from 'react'
import { FiUsers, FiActivity, FiGift, FiDollarSign } from 'react-icons/fi'
import StatsCard from '@/components/admin/StatsCard'
import TransactionVolumeChart from '@/components/admin/TransactionVolumeChart'
import OrbitsWalletCard from '@/components/admin/OrbitsWalletCard'
import RecentTransactionsTable from '@/components/admin/RecentTransactionsTable'

interface AdminStats {
  totalUsers: number
  totalUsersChange: number
  totalTransactions: number
  totalTransactionsChange: number
  airdropsDistributed: number
  airdropsChange: number
  totalYieldsPaid: number
  yieldsChange: number
}

interface ChartDataPoint {
  date: string
  volume: number
}

interface WalletData {
  address: string
  balance: number
  tokens: { name: string; symbol: string; value: number }[]
}

interface Transaction {
  id: string
  txId: string
  userId: string
  userEmail: string
  amount: number
  type: 'Purchase' | 'Yield' | 'Transfer' | 'Deposit' | 'Withdrawal'
  status: 'Completed' | 'Pending' | 'Failed'
  date: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [statsRes, chartRes, walletRes, transactionsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch(`/api/admin/chart-data?period=${chartPeriod}`),
          fetch('/api/admin/wallet'),
          fetch('/api/admin/transactions?limit=10')
        ])

        // Process stats
        const statsData = await statsRes.json()
        if (statsData.success && statsData.data) {
          setStats(statsData.data)
        }

        // Process chart data
        const chartDataRes = await chartRes.json()
        if (chartDataRes.success && chartDataRes.data) {
          setChartData(chartDataRes.data.data)
        }

        // Process wallet data
        const walletDataRes = await walletRes.json()
        if (walletDataRes.success && walletDataRes.data) {
          setWalletData(walletDataRes.data)
        }

        // Process transactions
        const transactionsData = await transactionsRes.json()
        if (transactionsData.success && transactionsData.data) {
          setTransactions(transactionsData.data.transactions)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [chartPeriod])

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-NG')}`
  }

  // Handle period change for chart
  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setChartPeriod(period)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#23262F] rounded-xl p-5 h-32" />
            ))}
          </div>
          {/* Chart and wallet skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#23262F] rounded-xl h-96" />
            <div className="bg-[#23262F] rounded-xl h-96" />
          </div>
          {/* Table skeleton */}
          <div className="bg-[#23262F] rounded-xl h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          subtitle="Active wallets on the platform"
          change={stats?.totalUsersChange || 0}
          icon={<FiUsers className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Transactions"
          value={stats?.totalTransactions.toLocaleString() || '0'}
          subtitle="All time transaction count"
          change={stats?.totalTransactionsChange || 0}
          icon={<FiActivity className="w-5 h-5" />}
        />
        <StatsCard
          title="Airdrops Distributed"
          value={formatCurrency(stats?.airdropsDistributed || 0)}
          subtitle="Tokens distributed to users"
          change={stats?.airdropsChange || 0}
          icon={<FiGift className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Yields Paid"
          value={formatCurrency(stats?.totalYieldsPaid || 0)}
          subtitle="Yield payments to holders"
          change={stats?.yieldsChange || 0}
          icon={<FiDollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Chart and Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Chart - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <TransactionVolumeChart
            data={chartData}
            period={chartPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>

        {/* Orbits Wallet Card - Takes 1/3 width on large screens */}
        <div>
          <OrbitsWalletCard
            address={walletData?.address || '0x1a2b3c...7q8r9s0t'}
            balance={walletData?.balance || 125000}
            tokens={walletData?.tokens || [
              { name: 'WTX Token', symbol: 'WTX', value: 50000 },
              { name: 'Club Token', symbol: 'CLUB', value: 75000 }
            ]}
          />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <RecentTransactionsTable transactions={transactions} />
    </div>
  )
}
