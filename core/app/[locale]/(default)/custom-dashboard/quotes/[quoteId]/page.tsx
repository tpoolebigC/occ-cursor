import { notFound } from 'next/navigation';
import { getQuotes } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

interface QuoteDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { quoteId } = await params;
  
  // Fetch quote data
  const result = await getQuotes();
  
  if (result.error || !result.quotes?.edges) {
    notFound();
  }

  // Find the specific quote
  const quote = result.quotes.edges.find(
    (edge: any) => edge.node.entityId.toString() === quoteId
  )?.node;

  if (!quote) {
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
      <B2BNavigation activeTab="quotes" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.entityId}</h1>
              <p className="text-gray-600">Created on {formatDate(quote.createdAt.utc)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                {quote.status}
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
          {/* Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quote Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Quote ID</p>
                  <p className="text-sm font-medium text-gray-900">#{quote.entityId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quote Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(quote.createdAt.utc)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{quote.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(quote.totalIncTax.value)}</p>
                </div>
              </div>
            </div>

            {/* Quote Items - Placeholder for now */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quote Items</h2>
              <div className="text-center py-8">
                <p className="text-gray-500">Quote items will be displayed here when available.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Total */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quote Total</h2>
              <div className="space-y-2">
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">{formatPrice(quote.totalIncTax.value)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
                  Convert to Order
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Download PDF
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Print Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 