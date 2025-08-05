import { getQuotes } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

export default async function QuotesPage() {
  const result = await getQuotes();
  
  if (result.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">Error Loading Quotes</h3>
            <p className="text-red-600 mt-2">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const quotes = result.quotes?.edges || [];

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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
              <p className="text-gray-600">View and manage your quote history</p>
            </div>
            <a
              href="/custom-dashboard"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        {/* Quotes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Quotes ({quotes.length})</h2>
          </div>
          
          {quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote ID
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((edge: any) => {
                    const quote = edge.node;
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <a 
                            href={`/custom-dashboard/quotes/${quote.id}`}
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            #{quote.id}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(quote.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(quote.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a
                              href={`/custom-dashboard/quotes/${quote.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </a>
                            {quote.status === 'APPROVED' && (
                              <button className="text-green-600 hover:text-green-900">
                                Convert to Order
                              </button>
                            )}
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
              <p className="text-gray-500">No quotes found.</p>
              <p className="text-sm text-gray-400 mt-2">Your quote history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 