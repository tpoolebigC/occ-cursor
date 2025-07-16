import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  ShoppingCartIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface StatsProps {
  stats: {
    totalQuotes: number;
    pendingQuotes: number;
    totalOrders: number;
    recentOrders: number;
    shoppingLists: number;
  };
}

export function B2BDashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      name: 'Total Quotes',
      value: stats.totalQuotes,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Recent Orders (30d)',
      value: stats.recentOrders,
      icon: ShoppingCartIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 