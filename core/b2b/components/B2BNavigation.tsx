'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface B2BNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function B2BNavigation({ activeTab = 'dashboard', onTabChange }: B2BNavigationProps) {
  const pathname = usePathname();
  const [showQuickOrder, setShowQuickOrder] = useState(false);

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.includes('/orders/')) return 'orders';
    if (pathname.includes('/invoices/')) return 'invoices';
    if (pathname.includes('/quotes/')) return 'quotes';
    if (pathname.includes('/quick-order')) return 'quick-order';
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/invoices')) return 'invoices';
    if (pathname.includes('/quotes')) return 'quotes';
    if (pathname === '/custom-dashboard') return 'dashboard';
    return activeTab;
  };

  const currentActiveTab = getActiveTab();

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/custom-dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      id: 'orders',
      name: 'Orders',
      href: '/custom-dashboard/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'quotes',
      name: 'Quotes',
      href: '/custom-dashboard/quotes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'invoices',
      name: 'Invoices',
      href: '/custom-dashboard/invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/custom-dashboard" className="text-xl font-bold text-gray-900">
                BigBiz
              </Link>
            </div>
            
            {/* Main Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const isActive = currentActiveTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Order Button */}
            <Link
              href="/custom-dashboard/quick-order"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quick Order
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive = currentActiveTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 