import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';
import { B2BOrdersList } from '~/components/b2b/b2b-orders-list';

export default async function B2BOrdersPage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  // Set the B2B token for API calls
  b2bClient.setCustomerToken(session.b2bToken);

  // Fetch orders data
  const orders = await b2bClient.getOrders().catch(() => []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">
          View and manage your B2B orders and their status.
        </p>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Orders</h2>
        </div>
        <div className="p-6">
          <B2BOrdersList orders={orders} />
        </div>
      </div>
    </div>
  );
} 