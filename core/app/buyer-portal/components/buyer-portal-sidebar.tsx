'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  ShoppingBag,
  FileText,
  Package,
  User,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/buyer-portal', icon: Home },
  { name: 'Orders', href: '/buyer-portal/orders', icon: ShoppingBag },
  { name: 'Quotes', href: '/buyer-portal/quotes', icon: FileText },
  { name: 'Catalog', href: '/buyer-portal/catalog', icon: Package },
  { name: 'Account', href: '/buyer-portal/account', icon: User },
  { name: 'Analytics', href: '/buyer-portal/analytics', icon: BarChart3 },
];

export function BuyerPortalSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-0 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Quick Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Orders</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Quotes</span>
              <span className="font-medium text-gray-900">2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Month</span>
              <span className="font-medium text-gray-900">$12,450</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 