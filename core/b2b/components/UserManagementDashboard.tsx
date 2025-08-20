'use client';

import { useState } from 'react';
import { UserManagement } from './UserManagement';
import { CompanyHierarchy } from './CompanyHierarchy';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  Building,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Define CustomerRole locally to avoid circular imports
enum CustomerRole {
  B2C = 0,           // Standard customer
  ADMIN = 1,         // Company admin
  SENIOR_BUYER = 2,  // Senior buyer
  JUNIOR_BUYER = 3,  // Junior buyer
  CUSTOM_ROLE = 4,   // Custom role
  SUPER_ADMIN = 100  // System admin
}

interface UserManagementDashboardProps {
  companyId?: number;
}

export function UserManagementDashboard({ companyId }: UserManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'activity' | 'settings' | 'hierarchy'>('users');

  const tabs = [
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'Add, edit, and manage users'
    },
    {
      id: 'permissions',
      name: 'Permissions',
      icon: Shield,
      description: 'Manage roles and permissions'
    },
    {
      id: 'activity',
      name: 'Activity Log',
      icon: Activity,
      description: 'View user activity and audit logs'
    },
    {
      id: 'hierarchy',
      name: 'Company Hierarchy',
      icon: Building,
      description: 'Manage company structure and subsidiaries'
    },
    {
      id: 'settings',
      name: 'Company Settings',
      icon: Settings,
      description: 'Manage company configuration'
    }
  ];

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'users':
          return <UserManagement companyId={companyId} />;
        case 'permissions':
          return <PermissionsManagement companyId={companyId} />;
        case 'activity':
          return <ActivityLog companyId={companyId} />;
        case 'hierarchy':
          return <CompanyHierarchy companyId={companyId} />;
        case 'settings':
          return <CompanySettings companyId={companyId} />;
        default:
          return <UserManagement companyId={companyId} />;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="p-6 text-center">
          <p className="text-red-600">Error loading content. Please try again.</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, permissions, and company settings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Permissions Management Component
function PermissionsManagement({ companyId }: { companyId?: number }) {
  const [roles] = useState([
    {
      id: 1,
      name: 'Admin',
      description: 'Full access to all features',
      permissions: ['orders', 'quotes', 'shopping_lists', 'user_management', 'company_settings'],
      userCount: 2
    },
    {
      id: 2,
      name: 'Senior Buyer',
      description: 'Can manage orders, quotes, and shopping lists',
      permissions: ['orders', 'quotes', 'shopping_lists'],
      userCount: 3
    },
    {
      id: 3,
      name: 'Junior Buyer',
      description: 'Can view orders and create shopping lists',
      permissions: ['orders', 'shopping_lists'],
      userCount: 5
    }
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Role Management</h2>
        <p className="text-gray-600">Manage user roles and their associated permissions</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">{role.userCount} users</span>
                </div>
              </div>
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                Edit Role
              </button>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-2">Permissions:</div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {permission.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity Log Component
function ActivityLog({ companyId }: { companyId?: number }) {
  const [activities] = useState([
    {
      id: 1,
      user: 'John Smith',
      action: 'Created shopping list',
      details: 'Shopping List "Office Supplies"',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'create'
    },
    {
      id: 2,
      user: 'Jane Doe',
      action: 'Updated user permissions',
      details: 'Modified permissions for Bob Wilson',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'update'
    },
    {
      id: 3,
      user: 'Bob Wilson',
      action: 'Added items to cart',
      details: 'Added 5 items to cart',
      timestamp: '2024-01-15T08:45:00Z',
      type: 'action'
    },
    {
      id: 4,
      user: 'John Smith',
      action: 'Submitted quote for approval',
      details: 'Quote #Q-2024-001',
      timestamp: '2024-01-14T16:20:00Z',
      type: 'approval'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'action':
        return <Activity className="w-4 h-4 text-purple-600" />;
      case 'approval':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Activity Log</h2>
        <p className="text-gray-600">Recent user activity and system events</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user} - {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
}

// Company Settings Component
function CompanySettings({ companyId }: { companyId?: number }) {
  const [settings] = useState({
    companyName: 'Acme Corporation',
    industry: 'Manufacturing',
    employeeCount: '100-500',
    billingAddress: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    contactInfo: {
      email: 'admin@acmecorp.com',
      phone: '+1-555-0123',
      website: 'www.acmecorp.com'
    },
    preferences: {
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      language: 'English',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Company Settings</h2>
        <p className="text-gray-600">Manage your company information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={settings.industry}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="100-500" selected>100-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.contactInfo.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={settings.contactInfo.phone}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={settings.contactInfo.website}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="USD" selected>USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="America/New_York" selected>Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="en" selected>English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Notification Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.preferences.notifications.email}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.preferences.notifications.sms}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.preferences.notifications.push}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Push notifications</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 