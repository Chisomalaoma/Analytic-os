import React, { useState, useEffect, useRef } from 'react';

const FILTER_TABS = [
    'Category', 'Price', 'Volume', 'Yield'
];

const CATEGORIES = [
    'All',
    'Software',
    'EdTech',
    'Fintech',
    'AI',
    'Blockchain',
    'DeFi',
    'Crypto',
    'Automotive',
];

export interface FilterState {
    categories: string[];
    priceRange: { min: number; max: number };
    volumeRange: { min: number; max: number };
    yieldRange: { min: number; max: number };
}

interface FiltersDropdownProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterState) => void;
}

export default function FiltersDropdown({ id, isOpen, onClose, onApplyFilters }: FiltersDropdownProps) {
    const [activeTab, setActiveTab] = useState('Category');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Filter state
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(10000000); // 10M max price
    const [volumeMin, setVolumeMin] = useState(0);
    const [volumeMax, setVolumeMax] = useState(100000000); // 100M max volume
    const [yieldMin, setYieldMin] = useState(0);
    const [yieldMax, setYieldMax] = useState(100);

    // Handle category selection
    const handleCategoryToggle = (category: string) => {
        if (category === 'All') {
            setSelectedCategories(['All']);
        } else {
            const newCategories = selectedCategories.includes(category)
                ? selectedCategories.filter(c => c !== category)
                : [...selectedCategories.filter(c => c !== 'All'), category];
            
            setSelectedCategories(newCategories.length === 0 ? ['All'] : newCategories);
        }
    };

    // Reset all filters
    const handleReset = () => {
        setSelectedCategories(['All']);
        setPriceMin(0);
        setPriceMax(10000000);
        setVolumeMin(0);
        setVolumeMax(100000000);
        setYieldMin(0);
        setYieldMax(100);
    };

    // Apply filters
    const handleApply = () => {
        onApplyFilters({
            categories: selectedCategories,
            priceRange: { min: priceMin, max: priceMax },
            volumeRange: { min: volumeMin, max: volumeMax },
            yieldRange: { min: yieldMin, max: yieldMax },
        });
        onClose();
    };

    // Calculate position when opened
    useEffect(() => {
        if (isOpen) {
            // Find the Filters button
            const filtersButton = document.querySelector('button[class*="cursor-pointer"][class*="hover:bg-secondary"]');
            if (filtersButton) {
                const rect = filtersButton.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 8, // 8px below the button
                    left: rect.right - 360, // Align right edge with button right edge
                });
            }
        }
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop to close on outside click */}
            <div
                id={`${id}-backdrop`}
                className="fixed inset-0 z-40"
                onClick={onClose}
            />
            <div
                ref={dropdownRef}
                id={id}
                className="fixed z-50 bg-[#0A0A0A] rounded-xl shadow-2xl w-[360px] p-4 animate-scaleIn"
                style={{
                    top: position.top,
                    left: Math.max(16, position.left), // Ensure it doesn't go off-screen left
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Filters</h3>
                        <p className="text-xs text-gray-400">Filter and sort the startups</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#23262F] rounded transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab
                                    ? 'bg-[#23262F] text-white'
                                    : 'bg-transparent text-gray-400 hover:bg-[#23262F]'
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="border-b border-[#23262F] mb-3" />

                {/* Tab Content */}
                <div className="max-h-[240px] overflow-y-auto">
                    {activeTab === 'Category' && (
                        <div className="space-y-2">
                            {CATEGORIES.map((label) => (
                                <label key={label} className="flex items-center gap-2 text-sm text-white cursor-pointer hover:bg-[#1A1A1A] p-1 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        className="appearance-none w-4 h-4 border border-gray-500 rounded bg-[#1A1A1A] checked:bg-[#4459FF] checked:border-[#4459FF] focus:outline-none cursor-pointer relative
                                        after:content-[''] after:absolute after:left-[3px] after:top-0 after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 checked:after:opacity-100"
                                        checked={selectedCategories.includes(label)}
                                        onChange={() => handleCategoryToggle(label)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    )}
                    {activeTab === 'Price' && (
                        <div>
                            <div className="text-sm text-gray-400 mb-2">Price Range (per token)</div>
                            <div className="flex justify-between text-sm text-white mb-2">
                                <span>₦{priceMin.toLocaleString()}</span>
                                <span>₦{priceMax.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={10000000} 
                                step={100000}
                                value={priceMax}
                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                className="w-full accent-[#4459FF] h-2 bg-[#23262F] rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="mt-3 text-xs text-gray-400">
                                Showing tokens up to ₦{priceMax.toLocaleString()}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Volume' && (
                        <div>
                            <div className="text-sm text-gray-400 mb-2">Volume Range</div>
                            <div className="flex justify-between text-sm text-white mb-2">
                                <span>₦{volumeMin.toLocaleString()}</span>
                                <span>₦{volumeMax.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100000000} 
                                step={1000000}
                                value={volumeMax}
                                onChange={(e) => setVolumeMax(Number(e.target.value))}
                                className="w-full accent-[#4459FF] h-2 bg-[#23262F] rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="mt-3 text-xs text-gray-400">
                                Showing tokens with volume up to ₦{volumeMax.toLocaleString()}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Yield' && (
                        <div>
                            <div className="text-sm text-gray-400 mb-2">Annual Yield Range</div>
                            <div className="flex justify-between text-sm text-white mb-2">
                                <span>{yieldMin}%</span>
                                <span>{yieldMax}%</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100} 
                                step={1}
                                value={yieldMax}
                                onChange={(e) => setYieldMax(Number(e.target.value))}
                                className="w-full accent-[#4459FF] h-2 bg-[#23262F] rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="mt-3 text-xs text-gray-400">
                                Showing tokens with yield up to {yieldMax}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#23262F]">
                    <button
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-1.5 rounded-lg bg-[#23262F] text-white text-sm hover:bg-[#2d3139] transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-1.5 rounded-lg bg-[#4459FF] text-white text-sm font-medium hover:bg-[#3448EE] transition-colors"
                            onClick={handleApply}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
