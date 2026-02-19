'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ListStartupForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        price: '',
        annualYield: '',
        industry: '',
        payoutFrequency: 'Monthly',
        investmentType: 'Equity',
        riskLevel: 'Medium',
        minimumInvestment: '',
        employeeCount: '',
        description: '',
        contractAddress: '',
        listingDate: new Date().toISOString().split('T')[0],
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/admin/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    symbol: formData.symbol.toUpperCase(),
                    price: parseFloat(formData.price) * 100, // Convert to kobo
                    annualYield: parseFloat(formData.annualYield),
                    industry: formData.industry,
                    payoutFrequency: formData.payoutFrequency,
                    investmentType: formData.investmentType,
                    riskLevel: formData.riskLevel,
                    minimumInvestment: parseFloat(formData.minimumInvestment) * 100, // Convert to kobo
                    employeeCount: parseInt(formData.employeeCount),
                    description: formData.description,
                    contractAddress: formData.contractAddress || null,
                    listingDate: formData.listingDate,
                    logoUrl: '',
                }),
            })

            const data = await res.json()

            if (data.success) {
                setSuccess('Token listed successfully!')
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            } else {
                setError(data.error || 'Failed to list token')
            }
        } catch (err) {
            setError('Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="bg-transparent" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                List your token
                <span className="bg-[#E6F7FF] text-[#013131] text-xs px-2 py-1 rounded-full font-medium">new</span>
            </h2>
            <p className="text-gray-400 mb-8 text-base">Get your token listed on our exchange.</p>
            
            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-2 text-sm">Company Name *</label>
                    <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="Enter the company name" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Ticker Symbol *</label>
                    <input 
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 uppercase" 
                        placeholder="e.g. AAPL" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Price per Token (₦) *</label>
                    <input 
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="e.g. 1500" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Annual Yield (%) *</label>
                    <input 
                        name="annualYield"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.annualYield}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="e.g. 35" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Industry *</label>
                    <input 
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="e.g. Technology" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Risk Level *</label>
                    <select 
                        name="riskLevel"
                        value={formData.riskLevel}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="Low" className="bg-gray-800">Low</option>
                        <option value="Medium" className="bg-gray-800">Medium</option>
                        <option value="High" className="bg-gray-800">High</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm">Payout Frequency *</label>
                    <select 
                        name="payoutFrequency"
                        value={formData.payoutFrequency}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="Monthly" className="bg-gray-800">Monthly</option>
                        <option value="Quarterly" className="bg-gray-800">Quarterly</option>
                        <option value="Annually" className="bg-gray-800">Annually</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm">Investment Type *</label>
                    <select 
                        name="investmentType"
                        value={formData.investmentType}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="Equity" className="bg-gray-800">Equity</option>
                        <option value="Debt" className="bg-gray-800">Debt</option>
                        <option value="Hybrid" className="bg-gray-800">Hybrid</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm">Minimum Investment (₦) *</label>
                    <input 
                        name="minimumInvestment"
                        type="number"
                        step="0.01"
                        value={formData.minimumInvestment}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="e.g. 1500" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Employee Count *</label>
                    <input 
                        name="employeeCount"
                        type="number"
                        value={formData.employeeCount}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" 
                        placeholder="e.g. 50" 
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm">Contract Address</label>
                    <input 
                        name="contractAddress"
                        type="text"
                        value={formData.contractAddress}
                        onChange={handleChange}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm" 
                        placeholder="e.g. 0xe54d08a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Blockchain contract address (optional)</p>
                </div>
            </div>
            <div className="mt-6">
                <label className="block mb-2 text-sm">Description</label>
                <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[100px]" 
                    placeholder="Describe your company and token offering" 
                />
            </div>
            <div className="flex justify-end mt-8">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#4459FF] text-white px-12 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </form>
    );
} 