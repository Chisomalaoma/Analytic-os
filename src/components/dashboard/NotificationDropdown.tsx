// src/components/dashboard/NotificationDropdown.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'

type NotificationType = 'alert' | 'transaction'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface NotificationDropdownProps {
  onClose: () => void
  onUnreadCountChange: (count: number) => void
}

type TabType = 'all' | 'alert' | 'transaction'

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.set('type', activeTab)
      }
      params.set('limit', '50')

      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()

      if (data.success) {
        setNotifications(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setLoading(false)
    }
  }, [activeTab])

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/count')
      const data = await res.json()
      if (data.success) {
        setCount(data.data.unreadCount)
        onUnreadCountChange(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
    }
    setLoading(false)
  }, [onUnreadCountChange])

  useEffect(() => {
    fetchNotifications()
    fetchCount()
  }, [fetchNotifications, fetchCount])

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      })

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      )
      if (count > 0) {
        const newCount = count - 1
        setCount(newCount)
        onUnreadCountChange(newCount)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setCount(0)
      onUnreadCountChange(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'alert', label: 'Alert' },
    { id: 'transaction', label: 'Transactions' }
  ]

  return (
    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-[#181A20] rounded-xl shadow-xl border border-[#858B9A33] overflow-hidden z-[9999] max-w-md mx-auto sm:mx-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#858B9A33]">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        {count > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-[#4459FF] hover:text-[#3448EE] transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#858B9A33]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 sm:py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-[#4459FF]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-3 sm:p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[#23262F] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#858B9A33]">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`relative p-3 sm:p-4 hover:bg-[#23262F] transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-[#1E2028]' : ''
                }`}
              >
                {/* Red dot for unread */}
                {!notification.isRead && (
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                )}

                <div className="flex items-start gap-2 sm:gap-3 ml-4 sm:ml-0">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'transaction'
                        ? 'bg-green-400/20 text-green-400'
                        : 'bg-[#4459FF]/20 text-[#4459FF]'
                    }`}
                  >
                    {notification.type === 'transaction' ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs sm:text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
