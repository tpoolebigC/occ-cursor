import { getInvoices } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

export default async function InvoicesPage() {
  const result = await getInvoices(50);
  
  if (result.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">Error Loading Invoices</h3>
            <p className="text-red-600 mt-2">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const invoices = result.customer?.orders?.edges || [];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <B2BNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600">View and manage your invoice history</p>
            </div>
            <a
              href="/custom-dashboard"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Invoices ({invoices.length})</h2>
          </div>
          
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((edge: any) => {
                    const invoice = edge.node;
                    const lineItems = invoice.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges || [];
                    return (
                      <tr key={invoice.entityId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <a 
                            href={`/custom-dashboard/invoices/${invoice.entityId}`}
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            #{invoice.entityId}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.orderedAt.utc)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status.value)}`}>
                            {invoice.status.value.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(invoice.totalIncTax.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a
                              href={`/custom-dashboard/invoices/${invoice.entityId}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </a>
                            <button className="text-gray-600 hover:text-gray-900">
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found.</p>
              <p className="text-sm text-gray-400 mt-2">Your invoice history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 