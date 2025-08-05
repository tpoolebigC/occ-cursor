import { getOrders } from '~/b2b/server-actions';

export default async function TestOrdersPage() {
  const ordersResult = await getOrders(100);
  
  console.log('Test Orders Result:', {
    hasError: !!ordersResult.error,
    error: ordersResult.error,
    hasCustomer: !!ordersResult.customer,
    hasOrders: !!ordersResult.customer?.orders,
    orderCount: ordersResult.customer?.orders?.edges?.length || 0,
    pageInfo: ordersResult.customer?.orders?.pageInfo,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">API Response</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(ordersResult, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Has Error</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.error ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.error || 'None'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Has Customer</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.customer ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Has Orders</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.customer?.orders ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Order Count</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.customer?.orders?.edges?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Has Next Page</dt>
                  <dd className="text-sm text-gray-900">{ordersResult.customer?.orders?.pageInfo?.hasNextPage ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {ordersResult.customer?.orders?.edges && ordersResult.customer.orders.edges.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Orders ({ordersResult.customer.orders.edges.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersResult.customer.orders.edges.map(({ node: order }: any) => (
                    <tr key={order.entityId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.entityId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderedAt.utc).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status.value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status.value === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          order.status.value === 'AWAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                          order.status.value === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.value.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalIncTax.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 