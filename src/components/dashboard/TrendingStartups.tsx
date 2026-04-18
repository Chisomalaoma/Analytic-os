import { useEffect, useState } from 'react';
import StartupCard from './StartupCard';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  logoUrl: string | null;
  volume: number;
  annualYield: number;
}

interface TrendingStartupsProps {
  watchlistIds: string[];
  onWatchlistToggle: (tokenId: string, isInWatchlist: boolean) => void;
}

export default function TrendingStartups({ watchlistIds, onWatchlistToggle }: TrendingStartupsProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens');
        const data = await res.json();
        if (data.success) {
          // Take top 5 tokens by volume for trending
          const sorted = [...data.tokens].sort((a: Token, b: Token) => b.volume - a.volume);
          setTokens(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="mt-4 flex gap-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#18191B] border border-[#232325] rounded-xl p-4 min-w-[220px] h-[100px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="mt-4 flex gap-4 overflow-x-auto">
        <div className="text-gray-400 text-sm py-4">No startups available</div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex gap-4 overflow-x-auto">
      {tokens.map((token) => (
        <StartupCard
          key={token.id}
          tokenId={token.symbol}
          name={token.name}
          symbol={token.symbol}
          price={token.price / 100} // Convert from kobo to naira
          change={Number(token.annualYield)} // Show annual yield as the change percentage
          logo={token.logoUrl || '/icons/company.svg'}
          initialIsInWatchlist={watchlistIds.includes(token.symbol)}
          onWatchlistToggle={onWatchlistToggle}
        />
      ))}
    </div>
  );
} 