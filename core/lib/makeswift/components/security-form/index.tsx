'use client'

import { useState } from 'react'
import { Save, Lock, Shield, Eye, EyeOff, Key } from 'lucide-react'

interface SecurityFormProps {
  onSave?: (data: any) => void
}

export default function SecurityForm({ onSave }: SecurityFormProps) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginNotifications: true,
    suspiciousActivityAlerts: true
  })

  const [isEditing, setIsEditing] = useState(false)

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = () => {
    onSave?.({ passwords, securitySettings })
    setIsEditing(false)
    // Clear password fields
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset all fields
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setSecuritySettings({
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginNotifications: true,
      suspiciousActivityAlerts: true
    })
  }

  const validatePasswords = () => {
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return false
    }
    if (passwords.newPassword && passwords.newPassword.length < 8) {
      return false
    }
    return true
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!validatePasswords()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-gray-400" />
          Change Password
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                disabled={!isEditing}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                disabled={!isEditing}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwords.newPassword && passwords.newPassword.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters long</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                disabled={!isEditing}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-gray-400" />
          Security Preferences
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Login Notifications</label>
              <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.loginNotifications}
                onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Suspicious Activity Alerts</label>
              <p className="text-xs text-gray-500">Get notified of unusual account activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.suspiciousActivityAlerts}
                onChange={(e) => handleSecurityChange('suspiciousActivityAlerts', e.target.checked)}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-gray-400" />
          Recent Login Activity
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">San Francisco, CA</p>
                <p className="text-xs text-gray-500">Chrome on Windows • 2 hours ago</p>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Current</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">New York, NY</p>
                <p className="text-xs text-gray-500">Safari on iPhone • 1 day ago</p>
              </div>
              <span className="text-xs text-gray-500">Previous</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">London, UK</p>
                <p className="text-xs text-gray-500">Firefox on Mac • 3 days ago</p>
              </div>
              <span className="text-xs text-gray-500">Previous</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 