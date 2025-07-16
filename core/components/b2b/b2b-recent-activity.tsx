import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: number;
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  href: string;
}

interface RecentActivityProps {
  title: string;
  items: ActivityItem[];
}

export function B2BRecentActivity({ title, items }: RecentActivityProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.subtitle} • {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.amount}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <Link
                            href={title.includes('Quotes') ? '/business/quotes' : '/business/orders'}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all {title.includes('Quotes') ? 'quotes' : 'orders'} →
          </Link>
        </div>
      )}
    </div>
  );
} 