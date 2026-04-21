'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import YieldChart from './YieldChart';

const ChartCard: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenSymbol = searchParams.get('symbol');
    const [isMobile, setIsMobile] = useState(false);

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
        <div>
            {/* Yield Chart */}
            {tokenSymbol && (
                <YieldChart tokenSymbol={tokenSymbol} />
            )}
            
            {/* Show message if no token symbol */}
            {!tokenSymbol && (
                <div className="bg-[#151517] rounded-lg p-4">
                    <div className="h-[320px] bg-[#181A20] rounded flex items-center justify-center text-gray-500 text-sm">
                        No token selected
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartCard; 