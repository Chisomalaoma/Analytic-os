'use client'

import React, { useState, useEffect } from 'react';
import { FiInfo, FiChevronDown } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils/formatNumber';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OverviewCardProps {
  walletBalance?: number;
  tokenSymbol?: string;
  onTradeComplete?: () => void; // Callback to refresh data after trade
}

type Currency = 'NGN' | 'USD';
type TradeType = 'buy' | 'sell';

const OverviewCard: React.FC<OverviewCardProps> = ({ walletBalance = 0, tokenSymbol = 'INV', onTradeComplete }) => {
  const [amount, setAmount] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(1500);
  const [tokenData, setTokenData] = useState<any>(null);
  const [periodVolume, setPeriodVolume] = useState<number>(0);
  const [yieldPayout, setYieldPayout] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // Add loading state for initial data fetch
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const { formatAmount: formatCurrencyAmount, currency: accountCurrency } = useCurrency();
  
  // Initialize currency based on account preference: USD → USD, NGN → NGN
  const [currency, setCurrency] = useState<Currency>(accountCurrency === 'USD' ? 'USD' : 'NGN');

  const USD_TO_NGN = 1650;

  const tokensAmount = amount ? parseFloat(amount) : 0;

  // Update local currency when account currency changes
  useEffect(() => {
    setCurrency(accountCurrency === 'USD' ? 'USD' : 'NGN');
  }, [accountCurrency]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setDataLoading(true);
        setError('');
        
        const balanceRes = await fetch(`/api/token/balance?symbol=${tokenSymbol}`);
        const balanceData = await balanceRes.json();
        if (balanceData.success && balanceData.holdings) {
          setTokenBalance(balanceData.holdings.quantity);
        }

        const tokensRes = await fetch('/api/tokens');
        const tokensData = await tokensRes.json();
        if (tokensData.success && tokensData.tokens) {
          const token = tokensData.tokens.find((t: any) => t.symbol === tokenSymbol);
          if (token) {
            setTokenPrice(token.price / 100);
            setTokenData(token);
          }
        }

        // Fetch yield payout for 30d period (default)
        const yieldRes = await fetch('/api/tokens/yield-payouts?period=30d');
        const yieldData = await yieldRes.json();
        if (yieldData.success && yieldData.yieldPayouts) {
          setYieldPayout(yieldData.yieldPayouts[tokenSymbol] || 0);
        }

        // Fetch period volume for 30d period (default)
        const volumeRes = await fetch('/api/tokens/period-volume?period=30d');
        const volumeData = await volumeRes.json();
        if (volumeData.success && volumeData.volumes) {
          setPeriodVolume(volumeData.volumes[tokenSymbol] || 0);
        }
      } catch (err) {
        console.error('Failed to fetch token data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchTokenData();
  }, [tokenSymbol]);

  const handleTrade = async () => {
    if (tradeType === 'buy') {
      await handleBuy();
    } else {
      await handleSell();
    }
  };

  const handleBuy = async () => {
    const inputAmount = parseFloat(amount);
    const nairaAmount = currency === 'NGN' ? inputAmount : inputAmount * USD_TO_NGN;
    
    if (!inputAmount || nairaAmount < tokenPrice) {
      setError(`Minimum purchase is ${formatCurrencyLocal(tokenPrice)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/token/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokenSymbol,
          nairaAmount 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`Purchase successful! ${data.purchase.tokensReceived} ${tokenSymbol} added to your holdings.`);
        setTokenBalance(data.purchase.newTokenBalance);
        setAmount('');
        
        // Trigger refresh of all data
        if (onTradeComplete) {
          onTradeComplete();
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Purchase failed');
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    const tokensToSell = parseFloat(amount);
    
    if (!tokensToSell || tokensToSell <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (tokensToSell > tokenBalance) {
      setError(`You only have ${tokenBalance} ${tokenSymbol} tokens`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/token/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokenSymbol,
          tokensToSell 
        }),
      });

      const data = await res.json();

      if (data.success) {
        const nairaReceived = data.sale.nairaReceived;
        const displayAmount = currency === 'NGN' 
          ? `₦${Math.round(nairaReceived).toLocaleString('en-NG')}` 
          : `$${Math.round(nairaReceived / USD_TO_NGN).toLocaleString('en-US')}`;
        setSuccessMessage(`Sale successful! ${tokensToSell} ${tokenSymbol} sold for ${displayAmount}`);
        setTokenBalance(data.sale.newTokenBalance);
        setAmount('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Sale failed');
      }
    } catch (err) {
      setError('Sale failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyLocal = (value: number) => {
    if (currency === 'NGN') {
      return formatCurrency(value);
    } else {
      return `$${Math.round(value / USD_TO_NGN).toLocaleString('en-US')}`;
    }
  };

  const getAvailableBalance = () => {
    if (currency === 'NGN') {
      return Math.round(walletBalance / 100).toLocaleString('en-NG');
    } else {
      return Math.round((walletBalance / 100) / USD_TO_NGN).toLocaleString('en-US');
    }
  };

  const getCurrencySymbol = () => currency === 'NGN' ? '₦' : '$';
  const getCurrencyLabel = () => currency === 'NGN' ? 'Naira' : 'USD';

  const getEstimatedValue = () => {
    if (!amount) return '0';
    if (tradeType === 'buy') {
      const tokens = Math.floor(tokensAmount / (currency === 'NGN' ? tokenPrice : tokenPrice / USD_TO_NGN));
      return `${tokens} ${tokenSymbol}`;
    } else {
      const value = tokensAmount * tokenPrice;
      return formatCurrencyLocal(value);
    }
  };

  return (
    <div className="bg-[#151517] rounded-lg p-3 text-gray-200">
      <div className="flex items-center mb-3">
        <span className="text-sm font-semibold mr-2">Overview</span>
        <FiInfo className="text-gray-400" size={14} />
      </div>

      {/* Loading State */}
      {dataLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-800 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-800 rounded"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
        </div>
      ) : (
        <>
          {/* Token Holdings */}
          <div className="mb-3 p-2 bg-[#181A20] rounded-lg">
            <div className="text-gray-400 text-xs">Your Holdings</div>
            <div className="text-white font-bold text-lg">{tokenBalance} {tokenSymbol}</div>
            {tokenBalance > 0 && (
              <div className="text-gray-400 text-xs mt-0.5">
                Value: {formatCurrencyAmount(tokenBalance * tokenPrice)}
              </div>
            )}
          </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 text-xs">
        <div>
          <div className="text-gray-400">Price per Unit</div>
          <div className="font-semibold text-white">{formatCurrencyAmount(tokenPrice)}</div>
        </div>
        <div>
          <div className="text-gray-400">Annual Yield</div>
          <div className="font-semibold text-white">
            {tokenData ? `${tokenData.annualYield}%` : '---'}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Volume</div>
          <div className="relative group">
            <div className="font-semibold text-white cursor-help">
              {formatCurrencyAmount(periodVolume)}
            </div>
            {periodVolume > 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                {formatCurrencyAmount(periodVolume)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Yield Payout</div>
          <div className="font-semibold text-white">
            {formatCurrencyAmount(yieldPayout)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Transactions</div>
          <div className="font-semibold text-white">{tokenData?.transactionCount || 0}</div>
        </div>
        <div>
          <div className="text-gray-400">Date of Listing</div>
          <div className="font-semibold text-white">
            {tokenData?.listingDate 
              ? new Date(tokenData.listingDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              : '---'
            }
          </div>
        </div>
        <div>
          <div className="text-gray-400">Contract Address</div>
          <div className="font-semibold text-white text-[10px] font-mono break-all">
            {tokenData?.contractAddress 
              ? `${tokenData.contractAddress.slice(0, 10)}...${tokenData.contractAddress.slice(-5)}`
              : '---'
            }
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && !dataLoading && (
        <div className="mb-2 p-1.5 bg-green-500/20 text-green-400 text-xs rounded text-center">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !dataLoading && (
        <div className="mb-2 p-1.5 bg-red-500/20 text-red-400 text-xs rounded text-center">
          {error}
        </div>
      )}

      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => {
            setTradeType('buy');
            setAmount('');
            setError('');
          }}
          className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tradeType === 'buy'
              ? 'bg-[#4459FF] text-white'
              : 'bg-[#181A20] text-gray-400 hover:bg-[#353945]'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => {
            setTradeType('sell');
            setAmount('');
            setError('');
          }}
          className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tradeType === 'sell'
              ? 'bg-[#FF4D4F] text-white'
              : 'bg-[#181A20] text-gray-400 hover:bg-[#353945]'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-1.5">
        <label className="block text-xs mb-1">
          {tradeType === 'buy' ? 'Amount' : 'Tokens to Sell'}
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
              setSuccessMessage('');
            }}
            className="w-full bg-[#181A20] border border-[#353945] rounded px-2 py-1.5 pr-24 text-white text-sm focus:outline-none focus:border-[#4459FF]"
            placeholder="0"
          />
          {/* Currency/Token Label */}
          {tradeType === 'buy' ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1 bg-[#353945] px-2 py-1 rounded text-xs hover:bg-[#404550] transition-colors"
              >
                <span className={`font-bold ${currency === 'NGN' ? 'text-green-400' : 'text-blue-400'}`}>
                  {getCurrencySymbol()}
                </span>
                <span className="text-white">{getCurrencyLabel()}</span>
                <FiChevronDown className="text-gray-400" size={12} />
              </button>
              
              {showCurrencyDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setShowCurrencyDropdown(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-1 bg-[#1A1A1A] border border-[#353945] rounded shadow-lg z-[100] min-w-[100px]">
                    <button
                      onClick={() => {
                        setCurrency('NGN');
                        setShowCurrencyDropdown(false);
                        setAmount('');
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[#353945] transition-colors ${
                        currency === 'NGN' ? 'bg-[#353945] text-green-400' : 'text-white'
                      }`}
                    >
                      <span className="font-bold">₦</span> Naira
                    </button>
                    <button
                      onClick={() => {
                        setCurrency('USD');
                        setShowCurrencyDropdown(false);
                        setAmount('');
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[#353945] transition-colors ${
                        currency === 'USD' ? 'bg-[#353945] text-blue-400' : 'text-white'
                      }`}
                    >
                      <span className="font-bold">$</span> USD
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#353945] px-2 py-1 rounded text-xs">
              <span className="text-white font-semibold">{tokenSymbol}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1">
          {tradeType === 'buy' ? (
            <>
              <span className="text-red-500">Min: {formatCurrencyLocal(tokenPrice)}</span>
              <span className="text-green-400">Available: {getCurrencySymbol()}{getAvailableBalance()}</span>
            </>
          ) : (
            <>
              <span className="text-gray-400">You'll receive: {getEstimatedValue()}</span>
              <span className="text-yellow-400">Available: {tokenBalance} {tokenSymbol}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Amount Buttons */}
      {tradeType === 'buy' ? (
        <div className="flex space-x-1.5 mb-2">
          {[tokenPrice, tokenPrice * 2, tokenPrice * 3, tokenPrice * 5].map((amt) => {
            const displayAmount = currency === 'NGN' ? amt : amt / USD_TO_NGN;
            return (
              <button
                key={amt}
                onClick={() => {
                  setAmount(displayAmount.toString());
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={amt * 100 > walletBalance}
                className="flex-1 bg-[#181A20] text-gray-300 rounded py-1 hover:bg-[#353945] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
              >
                {currency === 'NGN' 
                  ? `₦${Math.round(amt).toLocaleString('en-NG')}` 
                  : `$${Math.round(displayAmount)}`
                }
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex space-x-1.5 mb-2">
          {[25, 50, 75, 100].map((percent) => {
            const tokens = Math.floor((tokenBalance * percent) / 100);
            return (
              <button
                key={percent}
                onClick={() => {
                  setAmount(tokens.toString());
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={tokenBalance === 0}
                className="flex-1 bg-[#181A20] text-gray-300 rounded py-1 hover:bg-[#353945] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
              >
                {percent}%
              </button>
            );
          })}
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className={`w-full rounded py-1.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          tradeType === 'buy'
            ? 'bg-[#4459FF] hover:bg-[#3448EE] disabled:bg-[#353A45]'
            : 'bg-[#FF4D4F] hover:bg-[#E63946] disabled:bg-[#353A45]'
        } disabled:cursor-not-allowed text-white`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          tradeType === 'buy' ? 'Place Order' : 'Sell'
        )}
      </button>
        </>
      )}
    </div>
  );
};

export default OverviewCard;
