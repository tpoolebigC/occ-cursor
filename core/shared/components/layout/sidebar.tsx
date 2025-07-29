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
  Archive
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/custom-buyer-portal', icon: Home },
  { name: 'Customers', href: '/custom-buyer-portal/customers', icon: Users },
  { name: 'Orders', href: '/custom-buyer-portal/orders', icon: ShoppingCart, badge: '12' },
  { name: 'Quotes', href: '/custom-buyer-portal/quotes', icon: FileText, badge: '8' },
  { name: 'Catalog', href: '/custom-buyer-portal/catalog', icon: Package },
  { name: 'Analytics', href: '/custom-buyer-portal/analytics', icon: BarChart3 },
  { name: 'Shipping', href: '/custom-buyer-portal/shipping', icon: Truck },
  { name: 'Billing', href: '/custom-buyer-portal/billing', icon: CreditCard },
  { name: 'Reports', href: '/custom-buyer-portal/reports', icon: Archive },
  { name: 'Settings', href: '/custom-buyer-portal/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className = '', collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <div className={`bg-white border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-900">B2B Portal</span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
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
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>Custom Buyer Portal</p>
            <p>Powered by Catalyst</p>
          </div>
        </div>
      )}
    </div>
  );
} 