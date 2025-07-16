'use client';

import { useState } from 'react';
import { 
  BellIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export function B2BSettingsForm() {
  const [settings, setSettings] = useState({
    emailNotifications: {
      orderUpdates: true,
      quoteUpdates: true,
      marketingEmails: false,
      abandonedCart: true,
    },
    displayPreferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
    billing: {
      autoApproveQuotes: false,
      requireApproval: true,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/b2b/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Notifications */}
      <div>
        <div className="flex items-center mb-4">
          <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Order Updates</label>
              <p className="text-sm text-gray-500">Receive notifications when order status changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.orderUpdates}
              onChange={(e) => handleSettingChange('emailNotifications', 'orderUpdates', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Quote Updates</label>
              <p className="text-sm text-gray-500">Receive notifications when quote status changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.quoteUpdates}
              onChange={(e) => handleSettingChange('emailNotifications', 'quoteUpdates', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
              <p className="text-sm text-gray-500">Receive promotional and marketing communications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.marketingEmails}
              onChange={(e) => handleSettingChange('emailNotifications', 'marketingEmails', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Abandoned Cart</label>
              <p className="text-sm text-gray-500">Receive reminders for items left in cart</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.abandonedCart}
              onChange={(e) => handleSettingChange('emailNotifications', 'abandonedCart', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div>
        <div className="flex items-center mb-4">
          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Display Preferences</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.displayPreferences.currency}
              onChange={(e) => handleSettingChange('displayPreferences', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.displayPreferences.language}
              onChange={(e) => handleSettingChange('displayPreferences', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.displayPreferences.timezone}
              onChange={(e) => handleSettingChange('displayPreferences', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div>
        <div className="flex items-center mb-4">
          <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Billing & Quotes</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-Approve Quotes</label>
              <p className="text-sm text-gray-500">Automatically approve quotes under a certain amount</p>
            </div>
            <input
              type="checkbox"
              checked={settings.billing.autoApproveQuotes}
              onChange={(e) => handleSettingChange('billing', 'autoApproveQuotes', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Approval</label>
              <p className="text-sm text-gray-500">Require manual approval for all orders</p>
            </div>
            <input
              type="checkbox"
              checked={settings.billing.requireApproval}
              onChange={(e) => handleSettingChange('billing', 'requireApproval', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
} 