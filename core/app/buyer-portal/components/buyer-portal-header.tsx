'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

export function BuyerPortalHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            
            <Link href="/buyer-portal" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Buyer Portal</h1>
              </div>
            </Link>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
            >
              <BellIcon className="h-5 w-5" />
            </button>

            {/* Settings */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/buyer-portal/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Back to Store
                  </Link>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      // Handle logout
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/buyer-portal"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/buyer-portal/orders"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/buyer-portal/quotes"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Quotes
            </Link>
            <Link
              href="/buyer-portal/catalog"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catalog
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 