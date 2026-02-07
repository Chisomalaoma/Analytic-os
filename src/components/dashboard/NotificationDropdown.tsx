// src/components/dashboard/NotificationDropdown.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Bell, 
  AlertTriangle,
  Sparkles
} from 'lucide-react'

type NotificationType = 'alert' | 'transaction'
type TabType = 'all' | 'unread' | 'alerts'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: {
    action?: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'price_alert' | 'new_listing' | 'market_update' | 'system'
    amount?: number
    tokenSymbol?: string
  }
}

interface NotificationDropdownProps {
  onClose: () => void
  onUnreadCountChange: (count: number) => void
}

// Icon component for different notification types
const NotificationIcon = ({ action, type }: { action?: string; type: NotificationType }) => {
  const iconClass = "w-5 h-5"
  
  if (action === 'buy') {
    return (
      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
        <TrendingUp className={`${iconClass} text-green-500`} />
      </div>
    )
  }
  
  if (action === 'sell') {
    return (
      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
        <TrendingDown className={`${iconClass} text-red-500`} />
      </div>
    )
  }
  
  if (action === 'deposit') {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
        <ArrowDownCircle className={`${iconClass} text-blue-500`} />
      </div>
    )
  }
  
  if (action === 'withdrawal') {
    return (
      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
        <ArrowUpCircle className={`${iconClass} text-orange-500`} />
      </div>
    )
  }
  
  if (action === 'price_alert') {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
        <AlertTriangle className={`${iconClass} text-yellow-500`} />
      </div>
    )
  }
  
  if (action === 'new_listing') {
    return (
      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
        <Sparkles className={`${iconClass} text-purple-500`} />
      </div>
    )
  }
  
  // Default icon
  return (
    <div className="w-10 h-10 rounded-full bg-[#4459FF]/10 flex items-center justify-center">
      <Bell className={`${iconClass} text-[#4459FF]`} />
    </div>
  )
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
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
  }, [])

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
    { id: 'unread', label: 'Unread' },
    { id: 'alerts', label: 'Alerts' }
  ]

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead
    if (activeTab === 'alerts') return n.type === 'alert'
    return true
  })

  return (
    <div className="fixed sm:absolute right-2 sm:right-0 top-[60px] sm:top-full mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-[420px] bg-[#0A0A0A] rounded-xl shadow-2xl border border-[#23262F] overflow-hidden z-[9999] max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#23262F]">
        <div>
          <h3 className="text-base font-semibold text-white">Notifications</h3>
          {count > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{count} unread</p>
          )}
        </div>
        {count > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-[#4459FF] hover:text-[#3448EE] transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#23262F] bg-[#0D0D0D]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4459FF]" />
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#1A1A1A] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#1A1A1A] rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`relative p-4 hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#23262F] last:border-b-0 ${
                  !notification.isRead ? 'bg-[#0D0D0D]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <NotificationIcon 
                    action={notification.metadata?.action} 
                    type={notification.type} 
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(notification.createdAt)}
                    </span>
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
