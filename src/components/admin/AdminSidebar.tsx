"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  FaExchangeAlt, 
  FaCoins, 
  FaUsers, 
  FaCog, 
  FaTimes 
} from 'react-icons/fa'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const DashboardIcon = () => (
  <Image src="/icons/widget5.svg" alt="Dashboard" width={20} height={20} />
)

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/admin/transactions', label: 'Transactions', icon: FaExchangeAlt },
    { href: '/admin/tokens', label: 'Tokens', icon: FaCoins },
    { href: '/admin/users', label: 'Users', icon: FaUsers },
    { href: '/admin/settings', label: 'Settings', icon: FaCog },
  ]

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 min-h-screen w-64 bg-secondary border-r border-[#858B9A33] z-50
        flex flex-col
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

      {/* Logo */}
      <div className="text-2xl font-bold mb-8 px-4 pt-8">
        <span className="text-white">WTX</span>
        <span className="text-xs ml-2 px-2 py-1 bg-[#4459FF] rounded text-white">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                ${active 
                  ? 'bg-[#4459FF] text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#858B9A33]">
        <p className="text-xs text-gray-500 text-center">Admin Version 1.0.0</p>
      </div>
    </aside>
  )
}
