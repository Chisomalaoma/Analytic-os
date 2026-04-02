"use client"

import { FiSearch, FiMail, FiShield, FiUserX } from 'react-icons/fi'
import AdminCard from '@/components/admin/AdminCard'
import AdminTable from '@/components/admin/AdminTable'
import AdminButton from '@/components/admin/AdminButton'

export default function AdminUsersPage() {
  // Placeholder data for stats
  const stats = {
    totalUsers: 1250,
    activeUsers: 1180,
    newUsersThisMonth: 145
  }

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'walletBalance', label: 'Wallet Balance' },
    { key: 'joined', label: 'Joined' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 text-sm mt-1">View and manage platform users</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#23262F] rounded-xl p-5">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-[#23262F] rounded-xl p-5">
          <p className="text-sm text-gray-400">Active Users</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-[#23262F] rounded-xl p-5">
          <p className="text-sm text-gray-400">New This Month</p>
          <p className="text-2xl font-bold text-white mt-1">+{stats.newUsersThisMonth}</p>
        </div>
      </div>

      {/* Search */}
      <AdminCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4459FF]"
            />
          </div>

          <select className="px-3 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </AdminCard>

      {/* Users Table */}
      <AdminTable columns={columns} emptyMessage="User management functionality will be fully implemented in a future update.">
        {/* Placeholder rows */}
        <tr className="hover:bg-[#1A1D24]/50 transition-colors">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4459FF]/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-[#4459FF]">JD</span>
              </div>
              <span className="text-sm font-medium text-white">John Doe</span>
            </div>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm text-gray-300">john.doe@example.com</span>
          </td>
          <td className="px-5 py-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#4459FF]/10 text-[#4459FF]">
              User
            </span>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm font-medium text-white">₦125,000.00</span>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm text-gray-400">Jan 15, 2025</span>
          </td>
          <td className="px-5 py-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Active
            </span>
          </td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-1">
              <AdminButton variant="ghost" size="sm">
                <FiMail className="w-4 h-4" />
              </AdminButton>
              <AdminButton variant="ghost" size="sm">
                <FiShield className="w-4 h-4" />
              </AdminButton>
              <AdminButton variant="ghost" size="sm">
                <FiUserX className="w-4 h-4" />
              </AdminButton>
            </div>
          </td>
        </tr>
        <tr className="hover:bg-[#1A1D24]/50 transition-colors">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-500">AD</span>
              </div>
              <span className="text-sm font-medium text-white">Admin User</span>
            </div>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm text-gray-300">admin@xtes.app</span>
          </td>
          <td className="px-5 py-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Admin
            </span>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm font-medium text-white">₦0.00</span>
          </td>
          <td className="px-5 py-4">
            <span className="text-sm text-gray-400">Dec 1, 2024</span>
          </td>
          <td className="px-5 py-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Active
            </span>
          </td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-1">
              <AdminButton variant="ghost" size="sm">
                <FiMail className="w-4 h-4" />
              </AdminButton>
              <AdminButton variant="ghost" size="sm" disabled>
                <FiShield className="w-4 h-4" />
              </AdminButton>
              <AdminButton variant="ghost" size="sm" disabled>
                <FiUserX className="w-4 h-4" />
              </AdminButton>
            </div>
          </td>
        </tr>
      </AdminTable>
    </div>
  )
}
