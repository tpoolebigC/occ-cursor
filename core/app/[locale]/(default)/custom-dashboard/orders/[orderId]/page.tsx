import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEnrichedOrder } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { OrderActions } from '../_components/order-actions';

interface OrderDetailPageProps {
  params: Promise<{ orderId: string; locale: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId, locale } = await params;
  const bcOrderId = parseInt(orderId, 10);

  if (isNaN(bcOrderId)) {
    notFound();
  }

  let result: Awaited<ReturnType<typeof getEnrichedOrder>>;

  try {
    result = await getEnrichedOrder(bcOrderId);
  } catch (err) {
    console.error('[OrderDetailPage] Unhandled error fetching order:', err);
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation activeTab="orders" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">Error Loading Order</h3>
            <p className="text-red-600 mt-2">{err instanceof Error ? err.message : 'Unknown error'}</p>
            <Link href={`/${locale}/custom-dashboard/orders`} className="text-indigo-600 hover:underline mt-4 inline-block">
              &larr; Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (result.error || !result.order) {
    if (result.error) {
      return (
        <div className="min-h-screen bg-gray-50">
          <B2BNavigation activeTab="orders" />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800">Error Loading Order</h3>
              <p className="text-red-600 mt-2">{result.error}</p>
              <Link href={`/${locale}/custom-dashboard/orders`} className="text-indigo-600 hover:underline mt-4 inline-block">
                &larr; Back to Orders
              </Link>
            </div>
          </div>
        </div>
      );
    }
    notFound();
  }

  const order = result.order;

  const currencyCode = order.currencyCode || 'USD';
  const formatPrice = (price: unknown) => {
    if (price == null) return '$0.00';
    const num = typeof price === 'string' ? parseFloat(price) : Number(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(isNaN(num) ? 0 : num);
  };

  // B2B API returns createdAt as unix timestamp (number), V2 as ISO string
  const formatDate = (dateValue?: string | number | null) => {
    if (dateValue == null) return '--';
    let d: Date;
    if (typeof dateValue === 'number') {
      // Unix timestamps from B2B API (seconds since epoch)
      d = new Date(dateValue > 1e12 ? dateValue : dateValue * 1000);
    } else {
      d = new Date(dateValue);
    }
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: unknown) => {
    const s = String(status ?? '').toLowerCase();
    if (s.includes('completed')) return 'bg-green-100 text-green-800';
    if (s.includes('awaiting') || s.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('cancelled') || s.includes('refund')) return 'bg-red-100 text-red-800';
    if (s.includes('shipped')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const products = order.products ?? [];
  const billingAddress = order.billingAddress;
  const shippingAddresses = order.shippingAddress ? [order.shippingAddress] : [];
  const orderStatus = String(order.customStatus || order.status || 'Unknown');
  const numericBcOrderId = typeof order.bcOrderId === 'string' ? parseInt(order.bcOrderId, 10) : order.bcOrderId;
  const totalIncTax = typeof order.totalIncTax === 'string' ? parseFloat(order.totalIncTax) : Number(order.totalIncTax) || 0;
  const erpOrderNumber = order.extraStr1 || '';
  const companyName = order.companyInfo?.companyName || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation activeTab="orders" />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{numericBcOrderId}
                </h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(orderStatus)}`}>
                  {orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>Placed {formatDate(order.createdAt)}</span>
                {erpOrderNumber && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                    ERP: {erpOrderNumber}
                  </span>
                )}
                {order.poNumber && (
                  <span>PO: {order.poNumber}</span>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}/custom-dashboard/orders`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order info cards */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="Order ID" value={`#${numericBcOrderId}`} />
                <InfoItem label="ERP Order #" value={erpOrderNumber || '--'} highlight={!!erpOrderNumber} />
                <InfoItem label="PO Number" value={order.poNumber || '--'} />
                <InfoItem label="Company" value={companyName || '--'} />
                <InfoItem label="Status" value={orderStatus} />
                <InfoItem label="Payment" value={order.paymentMethod || '--'} />
                <InfoItem label="Payment Status" value={order.paymentStatus || '--'} />
                <InfoItem label="Date Shipped" value={order.dateShipped ? formatDate(order.dateShipped) : '--'} />
                {order.itemsTotal !== undefined && (
                  <InfoItem
                    label="Shipping Progress"
                    value={`${order.itemsShipped ?? 0} / ${order.itemsTotal} items shipped`}
                  />
                )}
                {order.customerMessage && (
                  <div className="col-span-2 md:col-span-4">
                    <InfoItem label="Customer Message" value={order.customerMessage} />
                  </div>
                )}
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Items ({products.length})
              </h2>
              {products.length > 0 ? (
                <div className="space-y-3">
                  {products.map((item: any) => (
                    <div
                      key={item.productId || item.sku}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {item.options?.map((opt: any) => (
                          <span
                            key={opt.optionName}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 mr-1 mt-1"
                          >
                            {opt.optionName}: {opt.optionValue}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.basePrice)} ea.
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(parseFloat(item.basePrice || '0') * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Line item details are not available for this order.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing Address */}
            {billingAddress && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h2>
                <AddressBlock address={billingAddress} />
              </div>
            )}

            {/* Shipping Address */}
            {shippingAddresses.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h2>
                {shippingAddresses.map((addr: any, i: number) => (
                  <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t' : ''}>
                    <AddressBlock address={addr} />
                  </div>
                ))}
              </div>
            )}

            {/* Order Totals */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Total</h2>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total (inc. tax)</span>
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(totalIncTax)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              <OrderActions
                bcOrderId={numericBcOrderId}
                products={products.map((p: any) => ({
                  productId: p.productId,
                  variantId: p.variantId,
                  name: p.productName,
                  sku: p.sku,
                  quantity: p.quantity,
                }))}
                hasShipment={!!order.dateShipped}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${highlight ? 'text-indigo-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function AddressBlock({ address }: { address: any }) {
  return (
    <div className="text-sm text-gray-700 space-y-0.5">
      <p className="font-medium">
        {address.firstName} {address.lastName}
      </p>
      {address.company && <p>{address.company}</p>}
      <p>{address.addressLine1}</p>
      {address.addressLine2 && <p>{address.addressLine2}</p>}
      <p>
        {address.city}, {address.state} {address.zipCode}
      </p>
      <p>{address.country}</p>
      {(address.phone || address.email) && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          {address.phone && <p className="text-gray-500">{address.phone}</p>}
          {address.email && <p className="text-gray-500">{address.email}</p>}
        </div>
      )}
    </div>
  );
}
