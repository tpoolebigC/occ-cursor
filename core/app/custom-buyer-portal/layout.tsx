import Link from 'next/link';
import { Suspense } from 'react';

import { ChevronRight, Users, BarChart3, ShoppingCart, FileText, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/custom-buyer-portal', icon: BarChart3 },
  { name: 'Customers', href: '/custom-buyer-portal/customers', icon: Users },
  { name: 'Orders', href: '/custom-buyer-portal/orders', icon: ShoppingCart },
  { name: 'Quotes', href: '/custom-buyer-portal/quotes', icon: FileText },
  { name: 'Analytics', href: '/custom-buyer-portal/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/custom-buyer-portal/settings', icon: Settings },
];

export default function CustomBuyerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Custom Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500">
              Custom B2B Portal
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <Suspense fallback={<div className="h-8 animate-pulse bg-gray-200 rounded" />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 