'use client';

import React, { useState } from 'react';

const ChartCard: React.FC = () => {
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const timeframes = ['1s', '1m', '5m', '15m', '1h', '4h', '1D'];

    return (
        <div className="bg-[#151517] rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <span className="text-white font-semibold text-sm sm:text-base">Chart</span>
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
                Candlestick Chart Here
            </div>
        </div>
    );
};

export default ChartCard; 