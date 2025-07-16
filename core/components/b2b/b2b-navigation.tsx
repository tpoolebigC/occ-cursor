'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

  const navigation = [
    { name: 'Dashboard', href: '/business', icon: HomeIcon },
    { name: 'Quick Order', href: '/business/quick-order', icon: ShoppingCartIcon },
    { name: 'Quotes', href: '/business/quotes', icon: DocumentTextIcon },
    { name: 'Orders', href: '/business/orders', icon: ClipboardDocumentListIcon },
    { name: 'Shopping Lists', href: '/business/shopping-lists', icon: ClipboardDocumentListIcon },
    { name: 'Profile', href: '/business/profile', icon: UserIcon },
    { name: 'Settings', href: '/business/settings', icon: Cog6ToothIcon },
  ];

export function B2BNavigation() {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="mt-6">
      <div className="px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sign Out */}
      <div className="mt-8 px-3">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Sign Out
        </button>
      </div>
    </nav>
  );
} 