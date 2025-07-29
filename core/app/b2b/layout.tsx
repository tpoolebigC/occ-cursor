'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Users, 
  Package,
  Settings,
  Home,
  CreditCard,
  Truck,
  Archive,
  Menu,
  X
} from 'lucide-react';

interface B2BNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: B2BNavigationItem[] = [
  { name: 'Dashboard', href: '/b2b', icon: Home },
  { name: 'Customers', href: '/b2b/customers', icon: Users },
  { name: 'Orders', href: '/b2b/orders', icon: ShoppingCart, badge: '12' },
  { name: 'Quotes', href: '/b2b/quotes', icon: FileText, badge: '8' },
  { name: 'Catalog', href: '/b2b/catalog', icon: Package },
  { name: 'Analytics', href: '/b2b/analytics', icon: BarChart3 },
  { name: 'Shipping', href: '/b2b/shipping', icon: Truck },
  { name: 'Billing', href: '/b2b/billing', icon: CreditCard },
  { name: 'Reports', href: '/b2b/reports', icon: Archive },
  { name: 'Settings', href: '/b2b/settings', icon: Settings },
];

interface B2BLayoutProps {
  children: React.ReactNode;
}

export default function B2BLayout({ children }: B2BLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-900">B2B Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>Clean B2B Architecture</p>
            <p>Powered by Catalyst</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-2"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">B2B Management</h1>
                <p className="text-sm text-gray-500">Clean API Client + Server Components</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Demo User</span>
                <span className="mx-2">•</span>
                <span>Acme Corporation</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 