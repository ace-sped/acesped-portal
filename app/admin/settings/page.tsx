"use client"

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Settings, Save, Globe, Lock, Bell, Database, 
  Mail, Palette, Shield, Check, AlertCircle 
} from 'lucide-react';

export default function SystemSettings() {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ACE Portal',
    siteDescription: 'Africa Center of Excellence for Sustainable Power and Energy Development',
    contactEmail: 'admin@aceportal.com',
    timezone: 'UTC',
    language: 'English',
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserRegistration: true,
    systemAlerts: true,
    weeklyReports: false,
    maintenanceMode: false,
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    backupFrequency: 'daily',
    retentionPeriod: 30,
    autoBackup: true,
  });

  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage('success', `${section} settings saved successfully`);
    } catch (error) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                General Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  >
                    <option>UTC</option>
                    <option>Africa/Lagos</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSaveSettings('General')}
              disabled={saving}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </button>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Security Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireUppercase}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, requireUppercase: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Require uppercase letters in passwords
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireNumbers}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumbers: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Require numbers in passwords
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireSpecialChars}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Require special characters in passwords
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Enable two-factor authentication
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={() => handleSaveSettings('Security')}
              disabled={saving}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </button>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable email notifications
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.newUserRegistration}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserRegistration: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Notify on new user registration
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.systemAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Send system alerts
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Send weekly reports
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.maintenanceMode}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Maintenance mode
                </span>
              </label>
            </div>
            <button
              onClick={() => handleSaveSettings('Notification')}
              disabled={saving}
              className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </button>
          </div>

          {/* Database Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Database & Backup Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={databaseSettings.backupFrequency}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, backupFrequency: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  value={databaseSettings.retentionPeriod}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, retentionPeriod: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={databaseSettings.autoBackup}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, autoBackup: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable automatic backups
                </span>
              </label>
            </div>
            <button
              onClick={() => handleSaveSettings('Database')}
              disabled={saving}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Database Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

