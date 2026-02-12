import React, { useState } from 'react';

const FILTER_TABS = [
    'Category', 'Price', 'Volume', 'Yield'
];

export default function FiltersModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState('Category');

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] rounded-xl shadow-2xl md:w-full w-[95%] max-w-2xl mx-4 sm:mx-auto p-6 relative">
                {/* Close button */}
                <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-semibold text-white mb-1">Filters</h2>
                <p className="text-gray-400 mb-4 text-lg">Filter and sort the startups displayed in the dashboard</p>
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-full text-base font-medium ${activeTab === tab ? 'bg-[#23262F] text-white' : 'bg-transparent text-gray-400 hover:bg-[#23262F]'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="border-b border-[#23262F] mb-4" />
                {/* Tab Content */}
                <div className="min-h-[180px]">
                    {activeTab === 'Category' && (
                        <div className='text-lg'>
                            <div className="font-medium text-white mb-2">Select Categories</div>
                            {/* <div className="grid grid-cols-2 gap-2 text-lg md:text-xl">
                                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> All</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Software</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> EdTech</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Fintech</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> AI</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Blockchain</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> DeFi</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Crypto</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Automotive</label>
                            </div> */}
                            <div className="grid grid-cols-2 gap-2 text-lg md:text-xl">
                                {[
                                    'All',
                                    'Software',
                                    'EdTech',
                                    'Fintech',
                                    'AI',
                                    'Blockchain',
                                    'DeFi',
                                    'Crypto',
                                    'Automotive',
                                ].map((label, index) => (
                                    <label key={index} className="flex items-center gap-2 text-white">
                                        <input
                                            type="checkbox"
                                            className="appearance-none w-5 h-5 border border-white rounded-sm bg-black checked:bg-white checked:border-white focus:outline-none"
                                            defaultChecked={label === 'All'}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Price' && (
                        <div className='text-lg'>
                            <div className="font-medium text-white mb-2">Price Range</div>
                            <input type="range" min={0} max={100} className="w-full accent-white" />
                            <div className="flex justify-between text-lg text-white mt-2">
                                <span>₦0</span>
                                <span>₦8,640,000</span>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Volume' && (
                        <div className='text-lg'>
                            <div className="font-medium text-white mb-2">Volume Range</div>
                            <input type="range" min={0} max={100} className="w-full accent-white" />
                            <div className="flex justify-between text-lg text-white mt-2">
                                <span>₦0</span>
                                <span>₦10,000,000</span>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Yield' && (
                        <div className='text-lg'>
                            <div className="font-medium text-white mb-2">Annual Yield Range</div>
                            <input type="range" min={0} max={35} className="w-full accent-white" />
                            <div className="flex justify-between text-lg text-white mt-2">
                                <span>0%</span>
                                <span>35%</span>
                            </div>
                        </div>
                    )}
                </div>
                {/* Footer */}
                <div className="flex justify-between items-center mt-8 border-t border-[#23262F] pt-4">
                    <button className="text-gray-400 hover:text-white">Reset</button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded bg-[#23262F] text-white" onClick={onClose}>Cancel</button>
                        <button className="px-4 py-2 rounded bg-white text-black font-semibold">Apply Filters</button>
                    </div>
                </div>
            </div>
        </div>
    );
} 