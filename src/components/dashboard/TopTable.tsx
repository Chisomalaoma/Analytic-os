import { useEffect, useState } from 'react';
import GainerRow from './GainerRow';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FilterState } from './FiltersDropdown';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  annualYield: number;
  industry: string;
  logoUrl: string | null;
  volume: number;
  listingDate: string;
}

interface YieldPayouts {
  [tokenSymbol: string]: number;
}

interface PeriodVolumes {
  [tokenSymbol: string]: number;
}

interface TopTableProps {
  activeTab?: string;
  timePeriod?: '1d' | '7d' | '30d' | '1yr';
  watchlistIds: string[];
  onWatchlistToggle: (tokenId: string, isInWatchlist: boolean) => void;
  filters: FilterState;
}

type TimePeriod = '1d' | '7d' | '30d' | '1yr';

export default function TopTable({ activeTab = 'all', timePeriod = '30d', watchlistIds, onWatchlistToggle, filters }: TopTableProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [yieldPayouts, setYieldPayouts] = useState<YieldPayouts>({});
  const [periodVolumes, setPeriodVolumes] = useState<PeriodVolumes>({});
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tokens
        const tokensRes = await fetch('/api/tokens');
        const tokensData = await tokensRes.json();
        
        // Fetch yield payouts for the selected period
        const yieldRes = await fetch(`/api/tokens/yield-payouts?period=${timePeriod}`);
        const yieldData = await yieldRes.json();
        
        // Fetch period-based volumes
        const volumeRes = await fetch(`/api/tokens/period-volume?period=${timePeriod}`);
        const volumeData = await volumeRes.json();
        
        if (tokensData.success) {
          let filtered = [...tokensData.tokens];
          
          // Apply category filter
          if (!filters.categories.includes('All')) {
            filtered = filtered.filter((t: Token) => 
              filters.categories.includes(t.industry)
            );
          }
          
          // Apply price filter (price is stored in cents, so multiply by 100)
          filtered = filtered.filter((t: Token) => {
            const priceInNaira = t.price / 100;
            return priceInNaira >= filters.priceRange.min && priceInNaira <= filters.priceRange.max;
          });
          
          // Apply yield filter
          filtered = filtered.filter((t: Token) => 
            t.annualYield >= filters.yieldRange.min && t.annualYield <= filters.yieldRange.max
          );
          
          // Filter based on active tab
          if (activeTab === 'volume') {
            // Apply volume filter and sort by period volume (highest first)
            filtered = filtered.filter((t: Token) => {
              const volume = volumeData.success ? (volumeData.volumes[t.symbol] || 0) : t.volume;
              return volume >= filters.volumeRange.min && volume <= filters.volumeRange.max;
            });
            filtered = filtered.sort((a: Token, b: Token) => {
              const aVolume = volumeData.success ? (volumeData.volumes[a.symbol] || 0) : a.volume;
              const bVolume = volumeData.success ? (volumeData.volumes[b.symbol] || 0) : b.volume;
              return bVolume - aVolume;
            });
          } else if (activeTab === 'upcoming') {
            // Show tokens with future listing dates
            const now = new Date();
            filtered = filtered.filter((t: Token) => new Date(t.listingDate) > now);
            filtered = filtered.sort((a: Token, b: Token) => 
              new Date(a.listingDate).getTime() - new Date(b.listingDate).getTime()
            );
          } else {
            // All listings - apply volume filter and sort by newest first
            filtered = filtered.filter((t: Token) => {
              const volume = volumeData.success ? (volumeData.volumes[t.symbol] || 0) : t.volume;
              return volume >= filters.volumeRange.min && volume <= filters.volumeRange.max;
            });
            filtered = filtered.sort((a: Token, b: Token) => 
              new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
            );
          }
          
          setTokens(filtered.slice(0, 20));
        }
        
        if (yieldData.success) {
          setYieldPayouts(yieldData.yieldPayouts);
        }
        
        if (volumeData.success) {
          setPeriodVolumes(volumeData.volumes);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, timePeriod, filters]); // Re-fetch when filters change

  if (loading) {
    return (
      <div className="bg-secondary rounded-lg pt-4 px-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4"></th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Industry</th>
              <th className="py-3 px-4">Annual Yield</th>
              <th className="py-3 px-4">Yield Payout</th>
              <th className="py-3 px-4">Volume</th>
              <th className="py-3 px-4">{timePeriod}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3 px-4"><div className="w-8 h-8 bg-gray-700 rounded-full" /></td>
                <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-700 rounded" /></td>
                <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-700 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-secondary rounded-lg pt-4 px-4 py-8 text-center text-gray-400">
        No tokens available
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg pt-4 px-4 overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-gray-400 text-sm">
            <th className="py-3 px-4"></th>
            <th className="py-3 px-4">Company</th>
            <th className="py-3 px-4">Price</th>
            <th className="py-3 px-4">Industry</th>
            <th className="py-3 px-4">Annual Yield</th>
            <th className="py-3 px-4">Yield Payout</th>
            <th className="py-3 px-4">Volume</th>
            <th className="py-3 px-4">{timePeriod}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => {
            // Get real yield payout from API data, fallback to 0
            const yieldPayout = yieldPayouts[token.symbol] || 0;
            
            // Get period-based volume, fallback to total volume
            const displayVolume = periodVolumes[token.symbol] !== undefined 
              ? periodVolumes[token.symbol] 
              : token.volume;
            
            return (
              <GainerRow
                key={token.id}
                logo={token.logoUrl || '/icons/weth.svg'}
                name={token.symbol}
                company={token.name}
                price={token.price / 100}
                change={0}
                industry={token.industry}
                annualYield={`${token.annualYield}%`}
                yieldPayout={formatAmount(yieldPayout, 2)}
                marketCap={formatAmount(displayVolume)}
                chart="/icons/chart.svg"
                tokenId={token.symbol}
                initialIsInWatchlist={watchlistIds.includes(token.symbol)}
                onWatchlistToggle={onWatchlistToggle}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
