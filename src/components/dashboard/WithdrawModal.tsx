// src/components/dashboard/WithdrawModal.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronDown, Building2, ArrowDownUp, Copy, Check } from 'lucide-react'

// Nigerian banks list - fetch from API for complete list
const NIGERIAN_BANKS = [
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '084', name: 'Enterprise Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '039', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '102', name: 'Titan Trust Bank' },
  { code: '103', name: 'Globus Bank' },
  { code: '107', name: 'Optimus Bank' },
  { code: '105', name: 'Premiumtrust Bank' },
  { code: '106', name: 'Signature Bank' },
  { code: '304', name: 'Stanbic Mobile' },
  { code: '305', name: 'Paycom (OPay)' },
  { code: '306', name: 'Safetrust Mortgage Bank' },
  { code: '307', name: 'Ekondo Microfinance Bank' },
  { code: '309', name: 'FBN Mortgages' },
  { code: '311', name: 'Parkway - ReadyCash' },
  { code: '999', name: 'Kuda Bank' },
  { code: '090110', name: 'VFD Microfinance Bank' },
  { code: '090267', name: 'Kuda Microfinance Bank' },
  { code: '100004', name: 'Opay Digital Services' },
  { code: '100033', name: 'PalmPay' },
  { code: '120001', name: 'Moniepoint Microfinance Bank' },
]

interface BankAccount {
  id: string
  accountNumber: string
  bankName: string
  bankCode: string
  accountName: string
  isDefault: boolean
}

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  balance: number // in kobo
  onWithdraw?: (data: { bankAccountId: string; amount: number; narration: string }) => void
}

export function WithdrawModal({ open, onClose, balance, onWithdraw }: WithdrawModalProps) {
  const [step, setStep] = useState<'select' | 'add' | 'confirm'>('select')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [narration, setNarration] = useState('Wallet withdrawal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [newBankCode, setNewBankCode] = useState('')
  const [newAccountName, setNewAccountName] = useState('')
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [copied, setCopied] = useState(false)

  // Format balance to NGN
  const formatCurrency = (kobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(kobo / 100)
  }

  // Fetch bank accounts
  const fetchBankAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      const data = await res.json()
      if (data.bankAccounts) {
        setBankAccounts(data.bankAccounts)
        // Auto-select first or default
        const defaultAccount = data.bankAccounts.find((acc: BankAccount) => acc.isDefault)
        const firstAccount = data.bankAccounts[0]
        if (defaultAccount) setSelectedBank(defaultAccount.id)
        else if (firstAccount) setSelectedBank(firstAccount.id)
      }
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchBankAccounts()
    }
  }, [open, fetchBankAccounts])

  // Verify account number when adding new bank
  const verifyAccount = useCallback(async () => {
    if (!newAccountNumber || !newBankCode) return
    if (newAccountNumber.length !== 10) {
      setError('Account number must be 10 digits')
      return
    }

    setVerifyingAccount(true)
    setError('')
    setNewAccountName('')

    try {
      const res = await fetch('/api/bank-accounts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: newAccountNumber,
          bankCode: newBankCode,
        }),
      })

      const data = await res.json()
      if (data.success && data.accountName) {
        setNewAccountName(data.accountName)
      } else {
        setError(data.error || 'Failed to verify account')
      }
    } catch (err) {
      setError('Failed to verify account')
    } finally {
      setVerifyingAccount(false)
    }
  }, [newAccountNumber, newBankCode])

  // Handle add bank account
  const handleAddBank = async () => {
    if (!newAccountNumber || !newBankCode || !newAccountName) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: newAccountNumber,
          bankCode: newBankCode,
        }),
      })

      const data = await res.json()
      if (data.bankAccount) {
        await fetchBankAccounts()
        setSelectedBank(data.bankAccount.id)
        setStep('select')
        setNewAccountNumber('')
        setNewBankCode('')
        setNewAccountName('')
      } else {
        setError(data.error || 'Failed to add bank account')
      }
    } catch (err) {
      setError('Failed to add bank account')
    } finally {
      setLoading(false)
    }
  }

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!selectedBank || !amount) return

    const amountInKobo = Math.round(parseFloat(amount) * 100)
    if (amountInKobo > balance) {
      setError('Insufficient balance')
      return
    }
    if (amountInKobo < 100) {
      setError('Minimum withdrawal is ₦1.00')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: selectedBank,
          amount: amountInKobo,
          narration,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess('Withdrawal initiated successfully!')
        setTimeout(() => {
          onWithdraw?.({ bankAccountId: selectedBank, amount: amountInKobo, narration })
          onClose()
          // Reset form
          setAmount('')
          setStep('select')
          setSuccess('')
        }, 2000)
      } else {
        setError(data.error || 'Withdrawal failed')
      }
    } catch (err) {
      setError('Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedBankData = bankAccounts.find((acc) => acc.id === selectedBank)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-[#23262F] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23262F] p-4 border-b border-[#353A45] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Withdraw Funds</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Available: <span className="text-green-400 font-medium">{formatCurrency(balance)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#181A20] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4">{error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            {success}
          </div>
        )}

        {step === 'select' ? (
          <>
            {/* Bank Account Selection */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Select Bank Account</label>
              <div className="relative">
                <button
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full bg-[#181A20] border border-[#353A45] rounded-xl px-3 py-2.5 text-left flex items-center justify-between hover:border-[#4459FF] transition-colors"
                >
                  {selectedBankData ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white font-medium text-sm">{selectedBankData.bankName}</p>
                        <p className="text-xs text-gray-400">{selectedBankData.accountNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Select bank account</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showBankDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#181A20] border border-[#353A45] rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                    {bankAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setSelectedBank(acc.id)
                          setShowBankDropdown(false)
                        }}
                        className="w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-[#23262F] transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{acc.bankName}</p>
                          <p className="text-xs text-gray-400 truncate">{acc.accountNumber} - {acc.accountName}</p>
                        </div>
                        {acc.isDefault && (
                          <span className="text-xs text-[#4459FF] bg-[#4459FF]/10 px-2 py-0.5 rounded">Default</span>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowBankDropdown(false)
                        setStep('add')
                      }}
                      className="w-full px-3 py-2.5 text-left flex items-center gap-2 text-[#4459FF] hover:bg-[#23262F] transition-colors border-t border-[#353A45] text-sm"
                    >
                      <span className="text-lg">+</span>
                      <span>Add new bank account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Account Display */}
            {selectedBankData && (
              <div className="bg-[#181A20] rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Account Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate max-w-[180px]">{selectedBankData.accountName}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBankData.accountName)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-1 hover:bg-[#23262F] rounded transition-colors flex-shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#181A20] border border-[#353A45] rounded-xl px-3 py-2.5 pl-7 text-white text-lg font-medium focus:outline-none focus:border-[#4459FF]"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <button
                  onClick={() => setAmount(((balance / 100) * 0.25).toFixed(2))}
                  className="text-gray-400 hover:text-white"
                >
                  25%
                </button>
                <button
                  onClick={() => setAmount(((balance / 100) * 0.50).toFixed(2))}
                  className="text-gray-400 hover:text-white"
                >
                  50%
                </button>
                <button
                  onClick={() => setAmount(((balance / 100) * 0.75).toFixed(2))}
                  className="text-gray-400 hover:text-white"
                >
                  75%
                </button>
                <button
                  onClick={() => setAmount((balance / 100).toFixed(2))}
                  className="text-gray-400 hover:text-white"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Narration */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Narration (optional)</label>
              <input
                type="text"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Wallet withdrawal"
                className="w-full bg-[#181A20] border border-[#353A45] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4459FF]"
              />
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={loading || !selectedBank || !amount || parseFloat(amount) * 100 > balance}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#353A45] disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-4 h-4" />
                  Withdraw {amount ? `₦${parseFloat(amount).toLocaleString()}` : ''}
                </>
              )}
            </button>
          </>
        ) : (
          /* Add Bank Account Form */
          <>
            <button
              onClick={() => setStep('select')}
              className="mb-3 text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              ← Back to withdrawal
            </button>

            <h3 className="text-base font-semibold text-white mb-3">Add Bank Account</h3>

            {/* Bank Selection */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Select Bank</label>
              <select
                value={newBankCode}
                onChange={(e) => setNewBankCode(e.target.value)}
                className="w-full bg-[#181A20] border border-[#353A45] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4459FF]"
              >
                <option value="">Select bank</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Account Number</label>
              <input
                type="text"
                value={newAccountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setNewAccountNumber(value)
                }}
                placeholder="Enter account number"
                className="w-full bg-[#181A20] border border-[#353A45] rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#4459FF]"
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={verifyAccount}
              disabled={verifyingAccount || !newAccountNumber || !newBankCode}
              className="w-full py-2.5 bg-[#353A45] hover:bg-[#4459FF] disabled:bg-[#353A45] disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors mb-3 text-sm"
            >
              {verifyingAccount ? 'Verifying...' : 'Verify Account'}
            </button>

            {/* Account Name Display */}
            {newAccountName && (
              <div className="bg-[#181A20] rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-400">Account Name</p>
                <p className="text-white font-medium text-sm">{newAccountName}</p>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddBank}
              disabled={loading || !newAccountNumber || !newBankCode || !newAccountName}
              className="w-full py-3 bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#353A45] disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {loading ? 'Adding...' : 'Add Bank Account'}
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
