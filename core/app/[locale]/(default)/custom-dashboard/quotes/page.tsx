import Link from 'next/link';
import { getQuotes } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { CreateQuoteButton } from './_components/CreateQuoteButton';

interface QuotesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function QuotesPage({ params: paramsPromise }: QuotesPageProps) {
  const { locale } = await paramsPromise;
  const result = await getQuotes();

  if (result.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-lg font-medium text-red-800">Error Loading Quotes</h1>
            <p className="text-red-600 mt-2">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const quotes = result.quotes ?? [];
  const isEmpty = quotes.length === 0;

  const formatPrice = (price: string | number, currency?: unknown) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    const code = typeof currency === 'object' && currency
      ? (currency as any).currencyCode || 'USD'
      : typeof currency === 'string' ? currency : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(num || 0);
  };

  const formatDate = (dateValue?: string | number) => {
    if (dateValue == null) return '--';
    let d: Date;
    if (typeof dateValue === 'number') {
      d = new Date(dateValue > 1e12 ? dateValue : dateValue * 1000);
    } else {
      if (!dateValue) return '--';
      d = new Date(dateValue);
    }
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status?: string) => {
    const s = (status ?? '').toLowerCase();
    if (s.includes('new') || s.includes('in process')) return 'bg-green-100 text-green-800';
    if (s.includes('draft') || s.includes('updated by customer')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('expired') || s.includes('archived')) return 'bg-red-100 text-red-800';
    if (s.includes('ordered')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
              <p className="text-gray-600">View and manage your quote history</p>
            </div>
            <Link
              href={`/${locale}/custom-dashboard`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>

        {isEmpty && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              No quotes yet. Create a quote to get started—add products and submit for approval or checkout.
            </p>
          </div>
        )}

        {/* Quotes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">All Quotes ({quotes.length})</h2>
            <CreateQuoteButton locale={locale} />
          </div>

          {quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
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
                  {quotes.map((quote: any) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link
                          href={`/${locale}/custom-dashboard/quotes/${quote.id}${quote.createdAt != null ? `?date=${encodeURIComponent(String(quote.createdAt))}` : ''}`}
                          className="text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          #{quote.quoteNumber || quote.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {quote.quoteTitle || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quote.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.statusLabel)}`}>
                          {quote.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(quote.grandTotal ?? quote.subtotal ?? 0, quote.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/${locale}/custom-dashboard/quotes/${quote.id}${quote.createdAt != null ? `?date=${encodeURIComponent(String(quote.createdAt))}` : ''}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes found</h3>
              <p className="mt-1 text-sm text-gray-500">Your quote history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
