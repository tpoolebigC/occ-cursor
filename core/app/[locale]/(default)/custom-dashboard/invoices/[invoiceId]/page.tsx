import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getB2BInvoice } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

interface InvoiceDetailPageProps {
  params: Promise<{ invoiceId: string; locale: string }>;
}

const statusMap: Record<number, string> = {
  0: 'Open',
  1: 'Partially Paid',
  2: 'Completed',
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { invoiceId, locale } = await params;

  const result = await getB2BInvoice(invoiceId);

  if (result.error || !result.invoice) {
    if (result.error) {
      return (
        <div className="min-h-screen bg-gray-50">
          <B2BNavigation activeTab="invoices" />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-lg font-medium text-red-800">Error Loading Invoice</h1>
              <p className="text-red-600 mt-2">{result.error}</p>
              <Link href={`/${locale}/custom-dashboard/invoices`} className="text-indigo-600 hover:underline mt-4 inline-block">
                &larr; Back to Invoices
              </Link>
            </div>
          </div>
        </div>
      );
    }
    notFound();
  }

  const invoice: any = result.invoice;

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
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: number) => {
    if (status === 2) return 'bg-green-100 text-green-800';
    if (status === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const statusLabel = statusMap[invoice.status] ?? `Status ${invoice.status}`;

  // Extract details from the B2B API response
  const details = invoice.details ?? {};
  const header = details.header ?? {};
  const costLines: Array<{ description: string; amount: { value: string; code: string } }> = header.costLines ?? [];
  const billingAddress = header.billingAddress ?? null;
  const shippingAddress = header.shippingAddress ?? billingAddress;
  const productList: any[] = details.productList ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation activeTab="invoices" />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Invoice #{invoice.invoiceNumber || invoiceId}
                </h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                {header.orderDate && <span>Order Date: {formatDate(header.orderDate)}</span>}
                {invoice.dueDate && <span>Due: {formatDate(invoice.dueDate)}</span>}
                {invoice.orderNumber && (
                  <Link href={`/${locale}/custom-dashboard/orders/${invoice.orderNumber}`} className="text-indigo-600 hover:underline">
                    Order #{invoice.orderNumber}
                  </Link>
                )}
                {invoice.purchaseOrderNumber && (
                  <span>PO: {invoice.purchaseOrderNumber}</span>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}/custom-dashboard/invoices`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Invoices
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice #</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {invoice.invoiceNumber || invoiceId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{invoice.type || 'Invoice'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Due Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{statusLabel}</p>
                </div>
                {invoice.orderNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">BC Order #</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      <Link href={`/${locale}/custom-dashboard/orders/${invoice.orderNumber}`} className="text-indigo-600 hover:underline">
                        #{invoice.orderNumber}
                      </Link>
                    </p>
                  </div>
                )}
                {invoice.purchaseOrderNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">PO Number</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{invoice.purchaseOrderNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line items / Products */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h2>
              {productList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productList.map((item: any, index: number) => (
                        <tr key={item.productId || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName || 'Product'}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.productName || item.name || 'Item'}</p>
                                {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                                {item.variantSku && item.variantSku !== item.sku && (
                                  <p className="text-xs text-gray-500">Variant: {item.variantSku}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">
                            {item.quantity ?? 1}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">
                            {formatPrice(item.unitPrice ?? item.basePrice)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {formatPrice(item.totalPrice ?? item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No line items available for this invoice.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing address */}
            {billingAddress && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
                <div className="text-sm text-gray-700 space-y-0.5">
                  {billingAddress.firstName && (
                    <p className="font-medium">{billingAddress.firstName} {billingAddress.lastName}</p>
                  )}
                  {billingAddress.street1 && <p>{billingAddress.street1}</p>}
                  {billingAddress.street2 && <p>{billingAddress.street2}</p>}
                  <p>
                    {billingAddress.city}
                    {billingAddress.state && `, ${billingAddress.state}`}
                    {billingAddress.zipCode && ` ${billingAddress.zipCode}`}
                  </p>
                  {billingAddress.country && <p>{billingAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Shipping address */}
            {shippingAddress && shippingAddress !== billingAddress && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-sm text-gray-700 space-y-0.5">
                  {shippingAddress.firstName && (
                    <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  )}
                  {shippingAddress.street1 && <p>{shippingAddress.street1}</p>}
                  {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
                  <p>
                    {shippingAddress.city}
                    {shippingAddress.state && `, ${shippingAddress.state}`}
                    {shippingAddress.zipCode && ` ${shippingAddress.zipCode}`}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Invoice totals */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Total</h2>
              <div className="space-y-2">
                {costLines.map((line, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm text-gray-600">{line.description}</span>
                    <span className="text-sm text-gray-900">{formatPrice(line.amount)}</span>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Original Balance</span>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(invoice.originalBalance)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-blue-700">
                  <span className="text-sm font-medium">Open Balance</span>
                  <span className="text-sm font-bold">{formatPrice(invoice.openBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
