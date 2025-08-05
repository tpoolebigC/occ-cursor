import { notFound } from 'next/navigation';
import { getOrders } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import ReorderButton from '~/b2b/components/ReorderButton';

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  
  // Fetch order data
  const result = await getOrders(50);
  
  if (result.error || !result.customer?.orders?.edges) {
    notFound();
  }

  // Find the specific order
  const order = result.customer.orders.edges.find(
    (edge: any) => edge.node.entityId.toString() === orderId
  )?.node;

  if (!order) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const lineItems = order.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges || [];
  const orderStatus = order.status?.value || 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <B2BNavigation activeTab="orders" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.entityId}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.orderedAt.utc)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(orderStatus)}`}>
                {orderStatus.replace('_', ' ')}
              </span>
              <a
                href="/custom-dashboard"
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-sm font-medium text-gray-900">#{order.entityId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(order.orderedAt.utc)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{orderStatus.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-sm font-medium text-gray-900">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {lineItems.map((item: any) => (
                  <div key={item.node.entityId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.node.image?.url && (
                      <img
                        src={item.node.image.url.replace('{:size}', '100x100')}
                        alt={item.node.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.node.name}</h3>
                      {item.node.brand && (
                        <p className="text-sm text-gray-500">Brand: {item.node.brand}</p>
                      )}
                      <p className="text-sm text-gray-500">Quantity: {item.node.quantity}</p>
                      <p className="text-sm text-gray-500">Price: {formatPrice(item.node.subTotalListPrice.value)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.node.subTotalListPrice.value * item.node.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
              <div className="text-sm text-gray-900">
                <p className="font-medium">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                {order.billingAddress.company && (
                  <p>{order.billingAddress.company}</p>
                )}
                <p>{order.billingAddress.address1}</p>
                {order.billingAddress.address2 && (
                  <p>{order.billingAddress.address2}</p>
                )}
                <p>{order.billingAddress.city}, {order.billingAddress.stateOrProvince} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.countryCode}</p>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Total</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm text-gray-900">
                    {formatPrice(lineItems.reduce((sum: number, item: any) => sum + (item.node.subTotalListPrice.value * item.node.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm text-gray-900">
                    {formatPrice(order.totalIncTax.value - lineItems.reduce((sum: number, item: any) => sum + (item.node.subTotalListPrice.value * item.node.quantity), 0))}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">{formatPrice(order.totalIncTax.value)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <ReorderButton orderId={order.entityId} lineItems={lineItems} />
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Download Invoice
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Track Shipment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 