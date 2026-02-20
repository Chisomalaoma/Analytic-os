"use client";

import { Camera, Save, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { useCurrency } from '@/contexts/CurrencyContext';
import NotificationSettings from "@/components/account/NotificationSettings";
import PriceAlertSettings from "@/components/account/PriceAlertSettings";
import ComplianceSection from "@/components/account/ComplianceSection";

const AccountContainer = () => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const user = session?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    username: "",
    email: "",
    phone: "",
  });

  // Check if this is a business account
  const isBusinessAccount = user?.role === 'ADMIN' || !!user?.companyName;

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
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
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
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

  // Update form data when session loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        companyName: (user as any).companyName || "",
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB - Cloudinary will handle compression)
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Image size must be less than 10MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Compress for preview only
        compressImage(result, (compressed) => {
          setPreview(compressed);
        });
      };
      reader.onerror = () => {
        setMessage('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (dataUrl: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize to max 400x400 for profile pictures
      const maxSize = 400;
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with 0.7 quality for smaller file size
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      setMessage('Failed to process image. Please try a different image.');
    };
    img.src = dataUrl;
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
      let imageUrl = user?.image || null;

      // If there's a new image preview, upload it to Cloudinary first
      if (preview) {
        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: preview })
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setMessage(uploadData.error || 'Failed to upload image');
          setLoading(false);
          return;
        }

        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          username: formData.username,
          phone: formData.phone,
          image: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update profile");
        setLoading(false);
        return;
      }

      // Update the session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          name: formData.username,
          username: formData.username,
          phone: formData.phone,
          image: imageUrl,
        },
      });
      
      setMessage("Profile updated successfully!");
      
      // Clear preview after successful save
      if (preview) {
        setPreview(null);
      }
      
      // Small delay to ensure session is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoading(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const formatAddress = (address?: string | null) => {
    if (!address) return "0x71C7...1234";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, companyName?: string | null) => {
    // For business accounts, use company name initials
    if (companyName) {
      const words = companyName.trim().split(' ');
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
      }
      return companyName.substring(0, 2).toUpperCase();
    }
    
    // For personal accounts, use first and last name
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  return (
    <div className="p-4 sm:p-8 pb-20 sm:pb-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        {/* Back Button - Mobile Only */}
        {isMobile && (
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Account</h1>
      </div>
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
              <div className="relative mb-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#1A1A1A] border-2 border-[#23262F]">
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
                    <div className="w-full h-full bg-gradient-to-br from-[#4459FF] to-[#3448EE] flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
                      {getInitials(user?.firstName, user?.lastName, (user as any)?.companyName)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#4459FF] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3448EE] transition-colors border border-[#0A0A0A]"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="text-xs sm:text-sm text-gray-400 text-center">Click to upload</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              {isBusinessAccount ? (
                // Business Account Fields
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4459FF]"
                      placeholder="Enter business name"
                    />
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
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed opacity-60 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your unique user identifier</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed opacity-60"
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
                </>
              ) : (
                // Personal Account Fields
                <>
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
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed opacity-60 font-mono"
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
                      className="w-full bg-[#1A1A1A] border border-[#23262F] rounded-lg px-4 py-2.5 text-gray-300 cursor-not-allowed opacity-60"
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
                </>
              )}

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm sm:text-base">Auto-Lock Wallet</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Automatically lock yield after token purchase
                </div>
              </div>
              <div className="flex-shrink-0 sm:ml-4">
                <ToggleSwitch checked={autoLock} onChange={handleAutoLockChange} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm sm:text-base">Hide Token Balances</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Mask financial information
                </div>
              </div>
              <div className="flex-shrink-0 sm:ml-4">
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
