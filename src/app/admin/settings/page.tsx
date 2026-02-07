"use client"

import { FiSave, FiRefreshCw, FiShield, FiBell, FiGlobe, FiDatabase } from 'react-icons/fi'
import AdminCard from '@/components/admin/AdminCard'
import AdminButton from '@/components/admin/AdminButton'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure platform settings and preferences</p>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <AdminCard
          title="General Settings"
          subtitle="Platform-wide configuration"
          action={
            <div className="w-10 h-10 bg-[#4459FF]/10 rounded-lg flex items-center justify-center text-[#4459FF]">
              <FiGlobe className="w-5 h-5" />
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platform Name</label>
              <input
                type="text"
                defaultValue="WTX"
                className="w-full px-3 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="support@wtx.com"
                className="w-full px-3 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Default Currency</label>
              <select className="w-full px-3 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]">
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
          </div>
        </AdminCard>

        {/* Security Settings */}
        <AdminCard
          title="Security Settings"
          subtitle="Authentication and access control"
          action={
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
              <FiShield className="w-5 h-5" />
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Session Timeout</p>
                <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
              </div>
              <select className="px-3 py-1.5 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">IP Whitelist</p>
                <p className="text-xs text-gray-500">Restrict admin access by IP</p>
              </div>
              <button className="w-12 h-6 bg-[#1A1D24] rounded-full relative border border-[#858B9A33]">
                <span className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
              </button>
            </div>
          </div>
        </AdminCard>

        {/* Notification Settings */}
        <AdminCard
          title="Notification Settings"
          subtitle="Email and alert preferences"
          action={
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500">
              <FiBell className="w-5 h-5" />
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">New User Alerts</p>
                <p className="text-xs text-gray-500">Email when new users register</p>
              </div>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Large Transaction Alerts</p>
                <p className="text-xs text-gray-500">Alert for transactions over threshold</p>
              </div>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Alert Threshold (₦)</label>
              <input
                type="number"
                defaultValue="1000000"
                className="w-full px-3 py-2 bg-[#1A1D24] border border-[#858B9A33] rounded-lg text-white text-sm focus:outline-none focus:border-[#4459FF]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Database Settings */}
        <AdminCard
          title="Database & Maintenance"
          subtitle="System maintenance options"
          action={
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
              <FiDatabase className="w-5 h-5" />
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg">
              <div>
                <p className="text-sm text-white">Database Status</p>
                <p className="text-xs text-gray-500">Last backup: Jan 10, 2026</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                Healthy
              </span>
            </div>
            <AdminButton variant="secondary" className="w-full">
              <FiRefreshCw className="w-4 h-4" />
              Run Database Backup
            </AdminButton>
            <AdminButton variant="secondary" className="w-full">
              <FiDatabase className="w-4 h-4" />
              Clear Cache
            </AdminButton>
          </div>
        </AdminCard>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <AdminButton>
          <FiSave className="w-4 h-4" />
          Save Changes
        </AdminButton>
      </div>

      {/* Info message */}
      <AdminCard className="p-4">
        <p className="text-sm text-gray-500 text-center">
          Settings functionality will be fully implemented in a future update. Changes are not persisted.
        </p>
      </AdminCard>
    </div>
  )
}
