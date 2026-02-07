import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed top-0 left-0 min-h-screen w-64 bg-secondary border-r border-[#858B9A33] z-50
                transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* Close button for mobile */}
            <button
                className="lg:hidden absolute top-4 right-4 text-2xl text-gray-400 hover:text-white"
                onClick={onClose}
                aria-label="Close sidebar"
            >
                <FaTimes />
            </button>
            <div className="text-2xl font-bold mb-12 px-4 pt-8">WTX</div>
            <nav className="flex flex-col gap-2 px-4">
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded font-semibold ${pathname === '/dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'
                        }`}
                >
                    <Image src="/icons/widget5.svg" alt="Dashboard" width={20} height={20} className="text-white" />
                    Dashboard
                </Link>
                <Link
                    href="/dashboard/portfolio"
                    className={`flex items-center gap-3 px-4 py-3 rounded ${pathname === '/dashboard/portfolio' ? 'bg-gray-800' : 'hover:bg-gray-800'
                        }`}
                >
                    <Image src="/icons/3-layers.svg" alt="Portfolio" width={20} height={20} className="text-white" />
                    Portfolio
                </Link>
            </nav>
        </aside>
    );
}