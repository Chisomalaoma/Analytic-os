'use client'

import { useRouter } from 'next/navigation'
import ListStartupBreadcrumb from '../components/list-startup/ListStartupBreadcrumb';
import ListStartupForm from '../components/list-startup/ListStartupForm';

export default function ListStartupContainer() {
    const router = useRouter()
    
    return (
        <div className="w-full mx-auto px-4 md:px-10 py-8">
            {/* Back Button - Above Breadcrumb */}
            <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
            >
                <svg 
                    className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            <ListStartupBreadcrumb />
            <div className='max-w-7xl mx-auto'>
                <ListStartupForm />
            </div>
        </div>
    );
} 