"use client";

import React, { useState, useEffect } from 'react';
import ToggleSwitch from '@/common/ToggleSwitch';
import { Check, AlertCircle, Plus, Trash2, Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
}

interface PriceAlert {
  id: string;
  tokenSymbol: string;
  thresholdPercentage: number;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

interface PriceAlertSettings {
  enabled: boolean;
  thresholdPercentage: number;
  watchedTokens: string[];
}

interface PriceAlertSettingsProps {
  className?: string;
}

const PriceAlertSettingsComponent: React.FC<PriceAlertSettingsProps> = ({ className }) => {
  const [settings, setSettings] = useState<PriceAlertSettings>({
    enabled: true,
    thresholdPercentage: 5.0,
    watchedTokens: []
  });
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state for creating new alerts
  const [selectedToken, setSelectedToken] = useState('');
  const [customThreshold, setCustomThreshold] = useState('5.0');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load initial data
  useEffect(() => {
    loadPriceAlertData();
  }, []);

  const loadPriceAlertData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/price-alerts');
      const data = await response.json();

      if (data.success) {
        setSettings(data.data.settings);
        setPriceAlerts(data.data.priceAlerts || []);
        setAvailableTokens(data.data.availableTokens || []);
      } else {
        throw new Error(data.error || 'Failed to load price alert settings');
      }
    } catch (error) {
      console.error('Failed to load price alert data:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load price alert settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<PriceAlertSettings>) => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/price-alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price alert settings');
      }

      // Update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
      if (data.data.priceAlerts) {
        setPriceAlerts(data.data.priceAlerts);
      }

      setMessage({ type: 'success', text: 'Price alert settings updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update price alert settings:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnabledToggle = (enabled: boolean) => {
    updateSettings({ enabled });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      updateSettings({ thresholdPercentage: value });
    }
  };

  const handleAddAlert = async () => {
    if (!selectedToken || !customThreshold) {
      setMessage({ type: 'error', text: 'Please select a token and enter a threshold' });
      return;
    }

    const threshold = parseFloat(customThreshold);
    if (isNaN(threshold) || threshold <= 0 || threshold > 100) {
      setMessage({ type: 'error', text: 'Threshold must be between 0.1 and 100' });
      return;
    }

    // Check if alert already exists for this token
    if (priceAlerts.some(alert => alert.tokenSymbol === selectedToken && alert.isActive)) {
      setMessage({ type: 'error', text: 'Price alert already exists for this token' });
      return;
    }

    const newWatchedTokens = [...settings.watchedTokens];
    if (!newWatchedTokens.includes(selectedToken)) {
      newWatchedTokens.push(selectedToken);
    }

    await updateSettings({
      watchedTokens: newWatchedTokens,
      thresholdPercentage: threshold
    });

    // Reset form
    setSelectedToken('');
    setCustomThreshold('5.0');
    setShowAddForm(false);
  };

  const handleDeleteAlert = async (tokenSymbol: string) => {
    const newWatchedTokens = settings.watchedTokens.filter(token => token !== tokenSymbol);
    await updateSettings({ watchedTokens: newWatchedTokens });
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getTokenInfo = (symbol: string) => {
    return availableTokens.find(token => token.symbol === symbol);
  };

  if (loading) {
    return (
      <div className={`bg-[#0A0A0A] border border-[#262626] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#4459FF] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading price alert settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0A0A0A] border border-[#262626] rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-[#4459FF]" />
          <div className="font-semibold text-white">Price Alert Settings</div>
        </div>
        <div className="text-gray-400 text-sm">
          Get notified when token prices change by your specified threshold
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

      {/* Enable/Disable Price Alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-[#23262F] mb-6 gap-3">
        <div className="flex-1">
          <div className="text-white font-medium text-sm sm:text-base">Enable Price Alerts</div>
          <div className="text-gray-400 text-xs mt-1">
            Receive notifications when token prices change significantly
          </div>
        </div>
        <div className="flex-shrink-0 sm:ml-4">
          <ToggleSwitch
            checked={settings.enabled}
            onChange={handleEnabledToggle}
          />
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Default Threshold Setting */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Threshold Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={settings.thresholdPercentage}
                onChange={handleThresholdChange}
                className="w-24 bg-[#1A1A1A] border border-[#23262F] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4459FF]"
              />
              <span className="text-gray-400">%</span>
              <span className="text-gray-400 text-sm">
                Get alerts when prices change by this percentage or more
              </span>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Active Price Alerts</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-3 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Alert
              </button>
            </div>

            {/* Add New Alert Form */}
            {showAddForm && (
              <div className="bg-[#1A1A1A] border border-[#23262F] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Token</label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#23262F] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4459FF]"
                    >
                      <option value="">Select a token</option>
                      {availableTokens
                        .filter(token => !priceAlerts.some(alert => alert.tokenSymbol === token.symbol && alert.isActive))
                        .map(token => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.name} ({token.symbol})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Threshold (%)</label>
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={customThreshold}
                      onChange={(e) => setCustomThreshold(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#23262F] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4459FF]"
                      placeholder="5.0"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleAddAlert}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Adding...' : 'Add Alert'}
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-[#23262F] hover:bg-[#2A2D3A] text-gray-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts List */}
            {priceAlerts.length > 0 ? (
              <div className="space-y-3">
                {priceAlerts.map((alert) => {
                  const tokenInfo = getTokenInfo(alert.tokenSymbol);
                  return (
                    <div
                      key={alert.id}
                      className="bg-[#1A1A1A] border border-[#23262F] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#4459FF]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#4459FF] font-semibold text-sm">
                            {alert.tokenSymbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {tokenInfo?.name || alert.tokenSymbol}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Alert at ±{alert.thresholdPercentage}% price change
                          </div>
                          {tokenInfo && (
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-gray-300 text-sm">
                                Current: {formatPrice(tokenInfo.price)}
                              </span>
                              <span
                                className={`text-sm flex items-center gap-1 ${
                                  tokenInfo.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {tokenInfo.priceChange24h >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {formatPercentage(tokenInfo.priceChange24h)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {alert.lastTriggeredAt && (
                          <div className="text-xs text-gray-500">
                            Last triggered: {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteAlert(alert.tokenSymbol)}
                          disabled={saving}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No price alerts configured</p>
                <p className="text-sm">Add your first alert to get started</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#4459FF]/5 border border-[#4459FF]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#4459FF] mt-0.5" />
              <div>
                <div className="text-[#4459FF] font-medium text-sm mb-1">How Price Alerts Work</div>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>• Alerts trigger when token prices change by your threshold percentage or more</p>
                  <p>• You'll receive notifications via email and web app (based on your notification settings)</p>
                  <p>• Alerts are checked every few minutes during market hours</p>
                  <p>• You can set different thresholds for different tokens</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceAlertSettingsComponent;