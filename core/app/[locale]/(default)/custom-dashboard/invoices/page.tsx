import Link from 'next/link';
import { getB2BInvoices } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

interface InvoicesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function InvoicesPage({ params: paramsPromise, searchParams }: InvoicesPageProps) {
  const { locale } = await paramsPromise;
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const limit = parseInt(params.limit ?? '25', 10);
  const offset = (page - 1) * limit;

  const result = await getB2BInvoices({
    offset,
    first: limit,
    search: params.q,
    status: params.status ? [params.status] : undefined,
  });

  const statusMap: Record<number, string> = {
    0: 'Open',
    1: 'Partially Paid',
    2: 'Completed',
  };

  const formatPrice = (bal?: { value?: string; amount?: string; code?: string } | string | number) => {
    if (!bal) return '$0.00';
    if (typeof bal === 'string' || typeof bal === 'number') {
      const num = typeof bal === 'string' ? parseFloat(bal) : bal;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
    }
    const num = parseFloat(bal.value ?? bal.amount ?? '0');
    const code = bal.code || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(num || 0);
  };

  const formatDate = (dateInput?: string | number) => {
    if (!dateInput) return '--';
    const d = typeof dateInput === 'number' ? new Date(dateInput * 1000) : new Date(dateInput);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: number | string) => {
    const s = typeof status === 'number' ? status : parseInt(String(status), 10);
    if (s === 2) return 'bg-green-100 text-green-800';
    if (s === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600">
                View and manage your invoices
                {result.pagination.totalCount > 0 && (
                  <span className="ml-1">({result.pagination.totalCount} total)</span>
                )}
              </p>
            </div>
            <Link
              href={`/${locale}/custom-dashboard`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>

        {result.error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              {result.error.includes('404') || result.error.includes('not found')
                ? 'Invoices module may not be enabled for this store. Contact your administrator.'
                : result.error}
            </p>
          </div>
        )}

        {!result.error && result.invoices.length === 0 && result.pagination.totalCount === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              No invoices yet. Invoices appear here once orders are invoiced by your company or store.
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Invoices ({result.invoices.length})
            </h2>
          </div>

          {result.invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Open Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        <Link href={`/${locale}/custom-dashboard/invoices/${invoice.id}`}>
                          {invoice.invoiceNumber || `#${invoice.id}`}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.orderNumber ? (
                          <Link
                            href={`/${locale}/custom-dashboard/orders/${invoice.orderNumber}`}
                            className="text-indigo-600 hover:underline"
                          >
                            #{invoice.orderNumber}
                          </Link>
                        ) : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.purchaseOrderNumber || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                          {statusMap[invoice.status] ?? `Status ${invoice.status}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(invoice.openBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(invoice.originalBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/${locale}/custom-dashboard/invoices/${invoice.id}`}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your invoice history will appear here once invoices are generated.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
