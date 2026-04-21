'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import YieldChart from './YieldChart';

const ChartCard: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenSymbol = searchParams.get('symbol');
    const [activeChart, setActiveChart] = useState<'price' | 'yield'>('yield');
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [isMobile, setIsMobile] = useState(false);
    const timeframes = ['1s', '1m', '5m', '15m', '1h', '4h', '1D'];

    console.log('ChartCard - tokenSymbol from URL:', tokenSymbol)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="space-y-4">
            {/* Chart Type Selector */}
            <div className="bg-[#151517] rounded-lg p-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveChart('yield')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeChart === 'yield'
                                ? 'bg-[#4459FF] text-white'
                                : 'bg-[#181A20] text-gray-300 hover:bg-[#353945]'
                        }`}
                    >
                        Yield Chart
                    </button>
                    <button
                        onClick={() => setActiveChart('price')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeChart === 'price'
                                ? 'bg-[#4459FF] text-white'
                                : 'bg-[#181A20] text-gray-300 hover:bg-[#353945]'
                        }`}
                    >
                        Price Chart
                    </button>
                </div>
            </div>

            {/* Yield Chart */}
            {activeChart === 'yield' && tokenSymbol && (
                <YieldChart tokenSymbol={tokenSymbol} />
            )}

            {/* Price Chart (Placeholder) */}
            {activeChart === 'price' && (
                <div className="bg-[#151517] rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {/* Back Button - Mobile Only */}
                            {isMobile && (
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                                    aria-label="Go back"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <span className="text-white font-semibold text-sm sm:text-base">Price Chart</span>
                        </div>
                        {/* Time Range Controls - Scrollable on mobile */}
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {timeframes.map((t) => (
                                <button 
                                    key={t} 
                                    onClick={() => setActiveTimeframe(t)}
                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                        activeTimeframe === t 
                                            ? 'bg-[#4459FF] text-white' 
                                            : 'bg-[#181A20] text-gray-300 hover:bg-[#353945]'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Chart Placeholder - Responsive height */}
                    <div className="h-[250px] sm:h-[320px] bg-[#181A20] rounded flex items-center justify-center text-gray-500 text-sm">
                        Price Chart Coming Soon
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartCard; 