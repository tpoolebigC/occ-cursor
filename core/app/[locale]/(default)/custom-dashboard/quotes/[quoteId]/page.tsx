import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuote } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { QuoteCheckoutButton } from './_components/quote-checkout-button';

interface QuoteDetailPageProps {
  params: Promise<{ quoteId: string; locale: string }>;
  searchParams: Promise<{ date?: string; uuid?: string }>;
}

export default async function QuoteDetailPage({ params, searchParams }: QuoteDetailPageProps) {
  const { quoteId, locale } = await params;
  const { date: dateParam } = await searchParams;
  const quoteIdNum = parseInt(quoteId, 10);

  if (isNaN(quoteIdNum)) {
    notFound();
  }

  const result = await getQuote(quoteIdNum, { date: dateParam });

  if (result.error || !result.quote) {
    if (result.error) {
      return (
        <div className="min-h-screen bg-gray-50">
          <B2BNavigation activeTab="quotes" />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-lg font-medium text-red-800">Error Loading Quote</h1>
              <p className="text-red-600 mt-2">{result.error}</p>
              <Link href={`/${locale}/custom-dashboard/quotes`} className="text-indigo-600 hover:underline mt-4 inline-block">
                &larr; Back to Quotes
              </Link>
            </div>
          </div>
        </div>
      );
    }
    notFound();
  }

  const quote = result.quote;

  const currencyCode = typeof quote.currency === 'object' && quote.currency
    ? (quote.currency as any).currencyCode || 'USD'
    : typeof quote.currency === 'string' ? quote.currency : 'USD';

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(num || 0);
  };

  // RFQ API returns dates as unix timestamps (numbers) or ISO strings
  const formatDate = (dateValue?: string | number) => {
    if (dateValue == null) return '--';
    const d = typeof dateValue === 'number' ? new Date(dateValue * 1000) : new Date(dateValue);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Official B2B Edition quote status codes:
  // https://developer.bigcommerce.com/b2b-edition/apis/rest-management/quote
  const statusMap: Record<number, string> = {
    0: 'New',
    2: 'In Process',
    3: 'Updated by Customer',
    4: 'Ordered',
    5: 'Expired',
    6: 'Archived',
    7: 'Draft',
  };

  const resolveStatus = (status: unknown): string => {
    if (typeof status === 'number') return statusMap[status] ?? `Status ${status}`;
    if (typeof status === 'string') return status || 'Unknown';
    return 'Unknown';
  };

  const getStatusBadgeColor = (status: unknown) => {
    const s = resolveStatus(status).toLowerCase();
    if (s.includes('new') || s.includes('in process')) return 'bg-green-100 text-green-800';
    if (s.includes('draft') || s.includes('updated by customer')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('expired') || s.includes('archived')) return 'bg-red-100 text-red-800';
    if (s.includes('ordered')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const quoteStatus = resolveStatus(quote.status);
  const lineItems = quote.productsList ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation activeTab="quotes" />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Quote #{quote.quoteNumber || quote.id || quoteId}
                </h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                  {quoteStatus}
                </span>
              </div>
              {quote.quoteTitle && (
                <p className="text-gray-600 mt-1">{quote.quoteTitle}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Created {formatDate(quote.createdAt)}
                {quote.expiredAt && <> &middot; Expires {formatDate(quote.expiredAt)}</>}
              </p>
            </div>
            <Link
              href={`/${locale}/custom-dashboard/quotes`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Quotes
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quote Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Quote ID</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">#{quote.id || quoteId}</p>
                </div>
                {quote.referenceNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Reference #</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{quote.referenceNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{quoteStatus}</p>
                </div>
                {quote.companyId?.companyName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Company</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{quote.companyId.companyName}</p>
                  </div>
                )}
                {quote.salesRepInfo?.salesRepEmail && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sales Rep</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{quote.salesRepInfo.salesRepEmail}</p>
                  </div>
                )}
              </div>
              {quote.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Notes</p>
                  <p className="text-sm text-gray-700 mt-1">{quote.notes}</p>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quote Items ({lineItems.length})
              </h2>
              {lineItems.length > 0 ? (
                <div className="space-y-3">
                  {lineItems.map((item: any, index: number) => (
                    <div
                      key={item.id || item.productId || index}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName || 'Product'}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.productName || 'Unknown Product'}
                        </h3>
                        {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                        <p className="text-sm text-gray-500">Qty: {item.quantity ?? 1}</p>
                        {item.options?.map((opt: any, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 mr-1 mt-1"
                          >
                            {opt.optionName}: {opt.optionValue}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        {item.basePrice !== undefined && (
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.basePrice)} ea.
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.totalAmount ?? (item.basePrice ?? 0) * (item.quantity ?? 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No line items found for this quote.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote total */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quote Total</h2>
              <div className="space-y-2">
                {quote.subtotal !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm text-gray-900">{formatPrice(quote.subtotal)}</span>
                  </div>
                )}
                {quote.discount !== undefined && Number(quote.discount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm text-green-600">-{formatPrice(quote.discount)}</span>
                  </div>
                )}
                {quote.taxTotal !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="text-sm text-gray-900">{formatPrice(quote.taxTotal)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Grand Total</span>
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(quote.grandTotal ?? quote.subtotal ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proceed to Checkout button */}
              <QuoteCheckoutButton
                quoteId={quote.id ?? quoteIdNum}
                quoteStatus={quoteStatus}
              />
            </div>

            {/* Quote messages / notes */}
            {(quote.notes || quote.legalTerms) && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Info</h2>
                {quote.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{quote.notes}</p>
                  </div>
                )}
                {quote.legalTerms && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Terms &amp; Conditions</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{quote.legalTerms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
