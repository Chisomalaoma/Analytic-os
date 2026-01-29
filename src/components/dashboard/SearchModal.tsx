import React, { forwardRef } from 'react';

const searchResults = [
    { icon: 'P', name: 'PayStack Tech Ltd', tag: 'PYSK • Software', price: '₦8.64', change: '+6.82%', changeColor: 'text-green-500' },
    { icon: 'W', name: 'Whisper Inc.', tag: 'WISP • EdTech', price: '₦2,896', change: '+5.71%', changeColor: 'text-green-500' },
    { icon: 'E', name: 'Edurex Service Inc.', tag: 'EDRX • Fintech', price: '₦208', change: '+4.63%', changeColor: 'text-green-500' },
    { icon: 'H', name: 'Hynet Tech Ltd', tag: 'HYNET • Software', price: '₦1,024', change: '+3.24%', changeColor: 'text-green-500' },
    { icon: 'I', name: 'Cerebral IO', tag: 'IO • AI', price: '₦6.56', change: '-0.52%', changeColor: 'text-red-500' },
    { icon: 'W', name: 'Tesla Corp', tag: 'WEETH • Automotive', price: '₦3,121,008', change: '-0.01%', changeColor: 'text-red-500' },
    { icon: 'B', name: 'Balancer', tag: 'BAL • DeFi', price: '₦1,680', change: '-3.69%', changeColor: 'text-red-500' },
    { icon: 'X', name: 'Mantoformin', tag: 'XAUT • Crypto', price: '₦5,239,536', change: '+1.03%', changeColor: 'text-green-500' },
];

const SearchModal = forwardRef<HTMLDivElement, { isOpen?: boolean; onClose: () => void }>((props, ref) => {
    if (!props.isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                ref={ref}
                className="bg-[#181A20] border border-[#23262F] rounded-2xl shadow-2xl w-full max-w-xl mx-4 sm:mx-auto p-0 overflow-hidden relative"
            >
                {/* Close button */}
                <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10" onClick={props.onClose}>&times;</button>
                <div className="border-b border-[#23262F] px-6 py-4">
                    <input
                        className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-base"
                        placeholder="Search startups, CA"
                        autoFocus
                    />
                </div>
                <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#23262F] scrollbar-track-transparent">
                    {searchResults.map((item, idx) => (
                        <div key={idx} className="flex items-center px-6 py-3 hover:bg-[#23262F] transition cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-[#23262F] flex items-center justify-center text-white font-bold text-lg mr-4">{item.icon}</div>
                            <div className="flex-1">
                                <div className="text-white font-medium leading-tight">{item.name}</div>
                                <div className="text-xs text-gray-400">{item.tag}</div>
                            </div>
                            <div className="text-right min-w-[90px]">
                                <div className="text-white font-semibold">{item.price}</div>
                                <div className={`text-xs ${item.changeColor}`}>{item.change}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default SearchModal; 