"use client";

import { Camera, Save, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useRef, useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { useCurrency } from '@/contexts/CurrencyContext';
import NotificationSettings from "@/components/account/NotificationSettings";
import PriceAlertSettings from "@/components/account/PriceAlertSettings";
import ComplianceSection from "@/components/account/ComplianceSection";

const AccountContainer = () => {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);

  const user = session?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
  });

  // Currency hook
  const { currency, exchangeRate, loading: currencyLoading, setCurrency } = useCurrency();

  // Settings state
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoLock, setAutoLock] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<any>(null);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        
        if (data.success) {
          const settings = data.data;
          setAutoLock(settings.autoLockEnabled);
          setCurrency(settings.currencyPreference as 'NGN' | 'USD');
          
          // Load notification preferences
          const notifPrefs = settings.notificationPreferences as any;
          if (notifPrefs) {
            setNotificationPreferences(notifPrefs);
            // Keep backward compatibility with existing toggles
            if (notifPrefs?.webApp) {
              setPushNotifications(notifPrefs.webApp.transactions);
              setPriceAlerts(notifPrefs.webApp.priceAlerts);
            }
          }
        } else {
          console.error('Failed to load settings from API:', data.error);
          // Fallback to localStorage
          const savedCurrency = localStorage.getItem('currencyPreference') as 'NGN' | 'USD';
          if (savedCurrency && ['NGN', 'USD'].includes(savedCurrency)) {
            setCurrency(savedCurrency);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to localStorage
        const savedCurrency = localStorage.getItem('currencyPreference') as 'NGN' | 'USD';
        if (savedCurrency && ['NGN', 'USD'].includes(savedCurrency)) {
          setCurrency(savedCurrency);
        }
      } finally {
        setSettingsLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  // Update form data when session loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrencyChange = async (newCurrency: 'NGN' | 'USD') => {
    console.log('Currency change requested:', newCurrency);
    
    // Update global context and localStorage immediately
    setCurrency(newCurrency);
    localStorage.setItem('currencyPreference', newCurrency);
    
    try {
      // Try the main API first
      let res = await fetch('/api/settings/currency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency })
      });

      console.log('Main API response status:', res.status);
      
      // If main API fails, try the simple fallback
      if (!res.ok && res.status === 500) {
        console.log('Main API failed, trying simple API...');
        res = await fetch('/api/settings/currency-simple', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currency: newCurrency })
        });
        console.log('Simple API response status:', res.status);
      }
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('API response data:', responseData);
        setMessage(`Currency changed to ${newCurrency}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await res.json();
        console.error('API error:', errorData);
        setMessage(`Currency changed to ${newCurrency} (saved locally)`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      setMessage(`Currency changed to ${newCurrency} (saved locally)`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAutoLockChange = async (enabled: boolean) => {
    setAutoLock(enabled);
    
    try {
      await fetch('/api/settings/auto-lock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoLockEnabled: enabled })
      });
    } catch (error) {
      console.error('Failed to update auto-lock:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const imageUrl = preview || user?.image;

      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          phone: formData.phone,
          image: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update profile");
      } else {
        // Update the session with new data
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: formData.username,
            username: formData.username,
            phone: formData.phone,
            image: imageUrl,
          },
        });
        
        setMessage("Profile updated successfully!");
        if (preview) {
          setPreview(null);
        }
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address?: string | null) => {
    if (!address) return "0x71C7...1234";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  return (
    <div className="p-4 sm:p-8 pb-20 sm:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">My Account</h1>
      <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Profile Settings */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="font-semibold text-white text-base sm:text-lg">Profile Settings</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Manage your personal information
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes("success")
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#1A1A1A] border-2 border-[#23262F]">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#4459FF] to-[#3448EE] flex items-center justify-center text-white text-2xl font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#4459FF] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3448EE] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="text-sm text-gray-400 mt-2">Click to upload</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4459FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4459FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4459FF]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.userId || ''}
                  disabled
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed opacity-60 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Your unique user identifier</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4459FF]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4459FF] hover:bg-[#3448EE] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        {/* <div className="bg-[#121314] border border-[#262626] rounded-lg p-8 flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-400 mb-4 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#4459FF] to-[#3448EE] flex items-center justify-center text-white text-xl font-semibold">
                                {getInitials(user?.firstName, user?.lastName)}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-300">{formatAddress(user?.walletAddress)}</span>
                        <RiShare2Fill className="text-gray-400" />
                        <RiFileCopyFill className="text-gray-400 cursor-pointer" />
                    </div>
                </div> */}

        {/* Notification Settings */}
        {notificationPreferences && (
          <NotificationSettings
            initialPreferences={notificationPreferences}
            onPreferencesChange={setNotificationPreferences}
          />
        )}

        {/* Price Alert Settings */}
        <PriceAlertSettings />

        {/* Wallet Settings */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="font-semibold text-white text-base sm:text-lg">Wallet Settings</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Configure your wallet preferences
            </div>
          </div>
          <div className="divide-y divide-[#23262F]">
            <div className="flex items-start sm:items-center justify-between py-3 sm:py-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm sm:text-base">Auto-Lock Wallet</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Automatically lock yield after token purchase
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch checked={autoLock} onChange={handleAutoLockChange} />
              </div>
            </div>
            <div className="flex items-start sm:items-center justify-between py-3 sm:py-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm sm:text-base">Hide Token Balances</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Mask financial information
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch checked={hideBalances} onChange={setHideBalances} />
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="font-semibold text-white text-base sm:text-lg">Currency Preferences</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Select your preferred currency for displaying prices
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Currency Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-b border-[#23262F]">
              <div className="flex-1">
                <div className="text-white text-sm sm:text-base">Display Currency</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  All prices will be shown in this currency
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCurrencyChange('NGN')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currency === 'NGN'
                      ? 'bg-[#4459FF] text-white'
                      : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#23262F]'
                  }`}
                >
                  NGN (₦)
                </button>
                <button
                  onClick={() => handleCurrencyChange('USD')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currency === 'USD'
                      ? 'bg-[#4459FF] text-white'
                      : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#23262F]'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* Exchange Rate Info */}
            {currency === 'USD' && exchangeRate && (
              <div className="bg-[#1A1A1A] border border-[#23262F] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Current Exchange Rate</div>
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {exchangeRate.displayRate}
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(exchangeRate.lastUpdated).toLocaleString()}
                </div>
                <div className="mt-3 pt-3 border-t border-[#23262F]">
                  <div className="text-xs text-gray-400 mb-1">Example:</div>
                  <div className="text-sm text-white">
                    ₦1,500 = ${(1500 * exchangeRate.rate).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {currencyLoading && currency === 'USD' && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#4459FF]"></div>
                <div className="text-sm text-gray-400 mt-2">Loading exchange rate...</div>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Section */}
        <ComplianceSection />
      </div>
    </div>
  );
};

export default AccountContainer;
