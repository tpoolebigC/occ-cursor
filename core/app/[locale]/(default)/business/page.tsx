import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';
import { B2BDashboardStats } from '~/components/b2b/b2b-dashboard-stats';
import { B2BRecentActivity } from '~/components/b2b/b2b-recent-activity';
import { B2BQuickActions } from '~/components/b2b/b2b-quick-actions';
import { B2BLoginPrompt } from '~/components/b2b/b2b-login-prompt';

export default async function B2BDashboardPage() {
  const session = await auth();

  // If no B2B token, show login prompt
  if (!session?.b2bToken) {
    return <B2BLoginPrompt />;
  }

  // Set the B2B token for API calls
  b2bClient.setCustomerToken(session.b2bToken);

  // Fetch dashboard data
  const [quotes, orders, shoppingLists] = await Promise.allSettled([
    b2bClient.getQuotes(),
    b2bClient.getOrders(),
    b2bClient.getShoppingLists(),
  ]);

  const quotesData = quotes.status === 'fulfilled' ? quotes.value : [];
  const ordersData = orders.status === 'fulfilled' ? orders.value : [];
  const shoppingListsData = shoppingLists.status === 'fulfilled' ? shoppingLists.value : [];

  // Calculate stats
  const stats = {
    totalQuotes: quotesData.length,
    pendingQuotes: quotesData.filter(q => q.status === 'pending').length,
    totalOrders: ordersData.length,
    recentOrders: ordersData.filter(o => {
      const orderDate = new Date(o.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate > thirtyDaysAgo;
    }).length,
    shoppingLists: shoppingListsData.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">B2B Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your business portal. Manage quotes, orders, and shopping lists.
        </p>
      </div>

      {/* Stats Cards */}
      <B2BDashboardStats stats={stats} />

      {/* Quick Actions */}
      <B2BQuickActions />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <B2BRecentActivity 
          title="Recent Quotes" 
          items={quotesData.slice(0, 5).map(quote => ({
            id: quote.id,
            title: `Quote #${quote.id}`,
            subtitle: quote.status,
            amount: `$${quote.total.toFixed(2)}`,
            date: quote.createdAt,
            href: `/business/quotes/${quote.id}`,
          }))}
        />
        
        <B2BRecentActivity 
          title="Recent Orders" 
          items={ordersData.slice(0, 5).map(order => ({
            id: order.id,
            title: `Order #${order.id}`,
            subtitle: order.status,
            amount: `$${order.total.toFixed(2)}`,
            date: order.createdAt,
            href: `/business/orders/${order.id}`,
          }))}
        />
      </div>
    </div>
  );
} 