import React, { forwardRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  annualYield: number;
  industry: string;
  logoUrl: string | null;
}

const SearchModal = forwardRef<HTMLDivElement, { isOpen?: boolean; onClose: () => void }>((props, ref) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Token[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { formatAmount } = useCurrency();

    useEffect(() => {
        if (!props.isOpen) {
            setQuery('');
            setResults([]);
            return;
        }

        const searchTokens = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                
                if (data.success && data.tokens) {
                    setResults(data.tokens);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchTokens, 300);
        return () => clearTimeout(debounce);
    }, [query, props.isOpen]);

    const handleTokenClick = (symbol: string) => {
        router.push(`/dashboard/token?symbol=${symbol}`);
        props.onClose();
    };

    if (!props.isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                ref={ref}
                className="bg-[#181A20] border border-[#23262F] rounded-2xl shadow-2xl w-full max-w-xl mx-4 sm:mx-auto p-0 overflow-hidden relative"
            >
                {/* Close button */}
                <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10" 
                    onClick={props.onClose}
                >
                    &times;
                </button>
                
                <div className="border-b border-[#23262F] px-6 py-4">
                    <input
                        className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-base"
                        placeholder="Search startups, CA"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#23262F] scrollbar-track-transparent">
                    {loading && (
                        <div className="px-6 py-8 text-center text-gray-400">
                            Searching...
                        </div>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                            No results found for "{query}"
                        </div>
                    )}

                    {!loading && !query && (
                        <div className="px-6 py-8 text-center text-gray-400">
                            Start typing to search for tokens
                        </div>
                    )}

                    {!loading && results.length > 0 && results.map((token) => (
                        <div 
                            key={token.id} 
                            className="flex items-center px-6 py-3 hover:bg-[#23262F] transition cursor-pointer"
                            onClick={() => handleTokenClick(token.symbol)}
                        >
                            {token.logoUrl ? (
                                <Image 
                                    src={token.logoUrl} 
                                    alt={token.symbol} 
                                    width={36} 
                                    height={36} 
                                    className="rounded-full mr-4"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-4">
                                    {token.symbol.substring(0, 2)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium leading-tight">{token.name}</div>
                                <div className="text-xs text-gray-400">{token.symbol} • {token.industry}</div>
                            </div>
                            <div className="text-right min-w-[90px]">
                                <div className="text-white font-semibold">{formatAmount(token.price / 100)}</div>
                                <div className="text-xs text-green-500">
                                    {token.annualYield.toFixed(2)}% APY
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

SearchModal.displayName = 'SearchModal';

export default SearchModal; 