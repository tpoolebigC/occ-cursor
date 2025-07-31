'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';

import { useB2BCatalyst } from '~/hooks/use-b2b-catalyst';

// Customer Profile Component
function CustomerProfile({ customer }: { customer: any }) {
  if (!customer) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-sm text-gray-900">
            {customer.firstName} {customer.lastName}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <p className="mt-1 text-sm text-gray-900">{customer.company}</p>
        </div>
        {customer.customerGroup && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Group</label>
            <p className="mt-1 text-sm text-gray-900">{customer.customerGroup.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Order History Component
function OrderHistory({ orders, loading }: { orders: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
      </div>
      <div className="p-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {order.totalAmount.amount} {order.totalAmount.currencyCode}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Quote List Component
function QuoteList({ quotes, loading }: { quotes: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Quotes</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Active Quotes</h2>
      </div>
      <div className="p-6">
        {quotes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No quotes found</p>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Quote #{quote.quoteNumber}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                    {quote.expiresAt && (
                      <p className="text-sm text-gray-500">
                        Expires: {new Date(quote.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {quote.totalAmount.amount} {quote.totalAmount.currencyCode}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quote.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                      quote.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Custom Buyer Portal Page
export default function CustomBuyerPortalPage() {
  const { data: session } = useSession();
  const customerAccessToken = session?.customerAccessToken?.value;
  
  const {
    customer,
    orders,
    quotes,
    loading,
    error,
    refreshData
  } = useB2BCatalyst(customerAccessToken);

  if (!customerAccessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the buyer portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Custom Buyer Portal</h1>
          <p className="mt-2 text-gray-600">
            Manage your B2B customers, orders, and quotes with full customization
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Customer Profile */}
        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 rounded-lg" />}>
          <CustomerProfile customer={customer} />
        </Suspense>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order History */}
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded" />}>
            <OrderHistory orders={orders} loading={loading} />
          </Suspense>

          {/* Quote Management */}
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded" />}>
            <QuoteList quotes={quotes} loading={loading} />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={refreshData}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View All Orders
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Customer Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 