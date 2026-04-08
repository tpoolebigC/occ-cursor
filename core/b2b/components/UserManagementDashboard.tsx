'use client';

import { useState } from 'react';
import { UserManagement } from './UserManagement';
import { CompanyHierarchy } from './CompanyHierarchy';
import { Users, Building } from 'lucide-react';

interface UserManagementDashboardProps {
  companyId?: string | number;
  defaultActiveTab?: 'users' | 'hierarchy';
}

export function UserManagementDashboard({ companyId, defaultActiveTab = 'users' }: UserManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'hierarchy'>(defaultActiveTab);

  const tabs = [
    {
      id: 'users' as const,
      name: 'User Management',
      icon: Users,
      description: 'Add, edit, and manage users',
    },
    {
      id: 'hierarchy' as const,
      name: 'Company Hierarchy',
      icon: Building,
      description: 'Manage company structure and subsidiaries',
    },
  ];

  const renderTabContent = () => {
    try {
      const companyIdStr = companyId ? String(companyId) : undefined;
      switch (activeTab) {
        case 'users':
          return <UserManagement companyId={companyIdStr} />;
        case 'hierarchy':
          return <CompanyHierarchy companyId={companyId} />;
        default:
          return <UserManagement companyId={companyIdStr} />;
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Team & Company Management</h2>
        <p className="text-gray-600 mt-1">Manage your team members and company structure</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">{tab.description}</p>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
