"use client"

import { useState, useRef, useEffect } from "react";
import SearchBar from '../common/SearchBar';
import FiltersButton from '../common/FiltersButton';
import ListStartupButton from '../common/ListStartupButton';
import TrendingStartups from '../components/dashboard/TrendingStartups';
import Tabs from '../components/dashboard/Tabs';
import TopTable from '../components/dashboard/TopTable';
import FiltersDropdown, { FilterState } from '../components/dashboard/FiltersDropdown';
import SearchDropdown from '@/components/dashboard/SearchDropdown';
import { KYCBanner } from '@/components/dashboard/KYCBanner';
import { SmileIDKYCModal } from '@/components/dashboard/SmileIDKYCModal';

export default function DashboardContainer() {
    const [showFilters, setShowFilters] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showKYCModal, setShowKYCModal] = useState(false);
    const [kycStatus, setKycStatus] = useState<string>('pending');
    const [activeTab, setActiveTab] = useState('all');
    const [timePeriod, setTimePeriod] = useState<'1d' | '7d' | '30d' | '1yr'>('30d');
    const [tokenCount, setTokenCount] = useState(0);
    const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        categories: ['All'],
        priceRange: { min: 0, max: 10000000 },
        volumeRange: { min: 0, max: 100000000 },
        yieldRange: { min: 0, max: 100 },
    });
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch token count
    useEffect(() => {
        const fetchTokenCount = async () => {
            try {
                const res = await fetch('/api/tokens');
                const data = await res.json();
                if (data.success && data.tokens) {
                    setTokenCount(data.tokens.length);
                }
            } catch (error) {
                console.error('Failed to fetch token count:', error);
            }
        };
        fetchTokenCount();
    }, []);

    // Check KYC status
    useEffect(() => {
        const checkKYCStatus = async () => {
            try {
                const res = await fetch('/api/kyc/status');
                const data = await res.json();
                if (data.status) {
                    setKycStatus(data.status);
                }
            } catch (error) {
                console.error('Failed to fetch KYC status:', error);
            }
        };
        checkKYCStatus();
    }, []);

    // Ensure user has a wallet (safety net for OAuth users)
    useEffect(() => {
        const ensureWallet = async () => {
            try {
                await fetch('/api/wallet/ensure', { method: 'POST' });
            } catch (error) {
                console.error('Failed to ensure wallet:', error);
            }
        };
        ensureWallet();
    }, []);

    // Fetch watchlist IDs
    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await fetch('/api/watchlist/ids');
                const data = await res.json();
                if (data.success && data.tokenIds) {
                    setWatchlistIds(data.tokenIds);
                }
            } catch (error) {
                console.error('Failed to fetch watchlist:', error);
            }
        };
        fetchWatchlist();
    }, []);

    // Handle watchlist toggle from any component
    const handleWatchlistToggle = (tokenId: string, isInWatchlist: boolean) => {
        if (isInWatchlist) {
            setWatchlistIds(prev => [...prev, tokenId]);
        } else {
            setWatchlistIds(prev => prev.filter(id => id !== tokenId));
        }
    };

    // Close on click outside and escape
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const dropdown = document.getElementById('filters-dropdown');
            const dropdownBackdrop = document.getElementById('filters-dropdown-backdrop');
            const filtersButton = document.querySelector('[class*="FiltersButton"]') as HTMLElement;

            if (showFilters && dropdown && dropdownBackdrop) {
                if (!dropdown.contains(event.target as Node) &&
                    !dropdownBackdrop.contains(event.target as Node) &&
                    (!filtersButton || !filtersButton.contains(event.target as Node))) {
                    setShowFilters(false);
                }
            }
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setShowFilters(false);
                setShowSearchDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showFilters]);

    return (
        <div className='flex-1'>
            <section className="mt-8 p-4 sm:p-6 md:p-8">
                {/* KYC Banner - Show only if KYC is not verified */}
                {kycStatus !== 'verified' && (
                    <KYCBanner onStartKYC={() => setShowKYCModal(true)} />
                )}
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1 sm:gap-0">
                        <h2 className="text-base xs:text-lg sm:text-xl font-semibold">
                            Explore Tokens
                            {tokenCount > 0 && (
                                <span className="ml-2 bg-white text-[#013131] font-medium text-xs xs:text-sm px-2 py-1 rounded-full">
                                    {tokenCount} {tokenCount === 1 ? 'token' : 'tokens'}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-3 sm:justify-end relative">
                        <div ref={searchDropdownRef}>
                            <SearchBar onClick={() => setShowSearchDropdown(true)} />
                            {showSearchDropdown && (
                                <SearchDropdown
                                    isOpen={showSearchDropdown}
                                    onClose={() => setShowSearchDropdown(false)}
                                />
                            )}
                        </div>
                        <div className="flex relative">
                            <FiltersButton onClick={() => setShowFilters(!showFilters)} />
                            <ListStartupButton />
                        </div>
                    </div>
                </div>
                <TrendingStartups 
                    watchlistIds={watchlistIds}
                    onWatchlistToggle={handleWatchlistToggle}
                />
            </section>
            <section className="mt-8">
                <Tabs 
                    onTabChange={setActiveTab} 
                    onTimePeriodChange={setTimePeriod}
                />
                <TopTable 
                    activeTab={activeTab} 
                    timePeriod={timePeriod}
                    watchlistIds={watchlistIds}
                    onWatchlistToggle={handleWatchlistToggle}
                    filters={filters}
                />
            </section>
            <FiltersDropdown
                id="filters-dropdown"
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApplyFilters={setFilters}
            />
            
            {/* SmileID KYC Modal */}
            <SmileIDKYCModal
                open={showKYCModal}
                onClose={() => setShowKYCModal(false)}
                onSuccess={() => {
                    setKycStatus('in_progress');
                    setShowKYCModal(false);
                }}
            />
        </div>
    );
}
