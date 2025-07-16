import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

export function B2BQuickActions() {
  const actions = [
    {
      name: 'Quick Order',
      description: 'Search and add products to cart quickly',
      href: '/business/quick-order',
      icon: MagnifyingGlassIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Create Quote',
      description: 'Create a new quote for your customer',
      href: '/business/quotes/new',
      icon: DocumentTextIcon,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'New Shopping List',
      description: 'Create a shopping list for future orders',
      href: '/business/shopping-lists/new',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Common tasks to help you work faster
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 rounded-lg p-2 ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.name}
                  </h4>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 