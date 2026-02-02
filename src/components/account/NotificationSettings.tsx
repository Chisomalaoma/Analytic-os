"use client";

import React, { useState, useEffect } from 'react';
import ToggleSwitch from '@/common/ToggleSwitch';
import { Check, AlertCircle } from 'lucide-react';

interface NotificationPreferences {
  email: {
    transactions: boolean;
    walletFunding: boolean;
    withdrawals: boolean;
    tokenPurchases: boolean;
    tokenSales: boolean;
    priceAlerts: boolean;
    securityAlerts: boolean;
  };
  webApp: {
    transactions: boolean;
    walletFunding: boolean;
    withdrawals: boolean;
    tokenPurchases: boolean;
    tokenSales: boolean;
    priceAlerts: boolean;
    securityAlerts: boolean;
  };
}

interface NotificationSettingsProps {
  initialPreferences?: NotificationPreferences;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

const defaultPreferences: NotificationPreferences = {
  email: {
    transactions: true,
    walletFunding: true,
    withdrawals: true,
    tokenPurchases: true,
    tokenSales: true,
    priceAlerts: false,
    securityAlerts: true,
  },
  webApp: {
    transactions: true,
    walletFunding: true,
    withdrawals: true,
    tokenPurchases: true,
    tokenSales: true,
    priceAlerts: true,
    securityAlerts: true,
  },
};

const notificationTypes = [
  {
    key: 'transactions' as const,
    label: 'Transaction Notifications',
    description: 'Receive alerts for all transaction activities',
  },
  {
    key: 'walletFunding' as const,
    label: 'Wallet Funding',
    description: 'Notifications when your wallet is funded',
  },
  {
    key: 'withdrawals' as const,
    label: 'Withdrawal Notifications',
    description: 'Alerts for withdrawal requests and completions',
  },
  {
    key: 'tokenPurchases' as const,
    label: 'Token Purchases',
    description: 'Notifications for token purchase activities',
  },
  {
    key: 'tokenSales' as const,
    label: 'Token Sales',
    description: 'Alerts for token sale activities',
  },
  {
    key: 'priceAlerts' as const,
    label: 'Price Alerts',
    description: 'Notifications when token prices change significantly',
  },
  {
    key: 'securityAlerts' as const,
    label: 'Security Alerts',
    description: 'Important security and account notifications',
  },
];

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialPreferences,
  onPreferencesChange,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || defaultPreferences
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    if (initialPreferences) {
      const hasChanged = JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
      setHasChanges(hasChanged);
    }
  }, [preferences, initialPreferences]);

  // Update both email and webApp preferences together
  const updatePreference = (
    type: keyof NotificationPreferences['email'],
    value: boolean
  ) => {
    const newPreferences = {
      ...preferences,
      email: {
        ...preferences.email,
        [type]: value,
      },
      webApp: {
        ...preferences.webApp,
        [type]: value,
      },
    };
    setPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const savePreferences = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationPreferences: preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification preferences');
      }

      setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
      setHasChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update preferences' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
      <div className="mb-6">
        <div className="font-semibold text-white">Notification Settings</div>
        <div className="text-gray-400 text-sm">
          Control which notifications you receive via email and in-app
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map((notificationType) => (
          <div 
            key={notificationType.key} 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#23262F] last:border-b-0 gap-3"
          >
            <div className="flex-1">
              <div className="text-white font-medium text-sm sm:text-base">{notificationType.label}</div>
              <div className="text-gray-400 text-xs mt-1">
                {notificationType.description}
              </div>
            </div>
            <div className="flex-shrink-0 sm:ml-4">
              <ToggleSwitch
                checked={preferences.email[notificationType.key]}
                onChange={(value) =>
                  updatePreference(notificationType.key, value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="mt-6 pt-4 border-t border-[#23262F]">
          <button
            onClick={savePreferences}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;