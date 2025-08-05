'use client';

import { useState, useEffect } from 'react';
import { getCustomerInfo, getOrders, getQuotes, getInvoices, searchAlgoliaProducts } from '~/b2b/server-actions';
import { AlgoliaProduct } from '~/b2b/server-actions';
import { getCustomerInfoB3, getOrdersB3, getQuotesB3, getInvoicesB3 } from '~/b2b/server-actions-b3';
import { ApiDebugger } from './ApiDebugger';
import { B2BNavigation } from './B2BNavigation';
// Temporarily commenting out debug components to isolate issues
// import { AuthDebugger } from './AuthDebugger';
// import { B2BLoginTrigger } from './B2BLoginTrigger';
// import { B3StorageDebugger } from './B3StorageDebugger';
// import { B3StorageInitializer } from './B3StorageInitializer';
// Temporarily commenting out the new B2B components to fix server error
// import { B2BAuthDebugger } from './B2BAuthDebugger';

interface DashboardData {
  customer: any;
  orders: number;
  quotes: number;
  invoices: number;
  customerData: any;
  ordersData: any;
  quotesData: any;
  invoicesData: any;
}

export function CustomB2BDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    customer: undefined,
    orders: 0,
    quotes: 0,
    invoices: 0,
    customerData: null,
    ordersData: null,
    quotesData: null,
    invoicesData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AlgoliaProduct[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Dashboard] Starting to load dashboard data...');

      const [customerResult, ordersResult, quotesResult, invoicesResult] = await Promise.all([
        getCustomerInfo().catch(err => {
          console.error('❌ [Dashboard] Customer info error:', err);
          return { customer: null, error: err.message };
        }),
        getOrders(50).catch(err => {
          console.error('❌ [Dashboard] Orders error:', err);
          return { customer: null, error: err.message };
        }),
        getQuotes().catch(err => {
          console.error('❌ [Dashboard] Quotes error:', err);
          return { quotes: { edges: [] }, error: err.message };
        }),
        getInvoices(50).catch(err => {
          console.error('❌ [Dashboard] Invoices error:', err);
          return { customer: null, error: err.message };
        }),
      ]);

      console.log('📊 [Dashboard] API Results:', {
        customer: customerResult,
        orders: ordersResult,
        quotes: quotesResult,
        invoices: invoicesResult,
      });

      const customer = customerResult.customer;
      const orders = ordersResult.customer?.orders?.edges || [];
      const quotes = quotesResult.quotes?.edges || [];
      const invoices = invoicesResult.customer?.orders?.edges || []; // Using orders as invoices for now

      setDashboardData({
        customer,
        orders: orders.length,
        quotes: quotes.length,
        invoices: invoices.length,
        customerData: customerResult,
        ordersData: ordersResult,
        quotesData: quotesResult,
        invoicesData: invoicesResult,
      });

      console.log('✅ [Dashboard] Dashboard data loaded successfully:', {
        customer: customer?.firstName,
        orders: orders.length,
        quotes: quotes.length,
        invoices: invoices.length,
      });
    } catch (err) {
      console.error('❌ [Dashboard] Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchAlgoliaProducts(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleQuickOrder = async () => {
    setShowQuickOrder(true);
  };

  const handleCloseQuickOrder = () => {
    setShowQuickOrder(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading B2B Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <B2BNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Account Summary */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="text-lg font-semibold text-gray-900">
                {dashboardData.customer?.firstName || 'Not loaded'}
              </p>
              <p className="text-sm text-gray-600">{dashboardData.customer?.company}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Orders</h3>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.orders}</p>
              <p className="text-sm text-gray-600">Total orders</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Quotes</h3>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.quotes}</p>
              <p className="text-sm text-gray-600">Active quotes</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Invoices</h3>
              <p className="text-lg font-semibold text-gray-900">{dashboardData.invoices}</p>
              <p className="text-sm text-gray-600">Total invoices</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'orders', name: 'Orders', count: dashboardData.orders },
                { id: 'quotes', name: 'Quotes', count: dashboardData.quotes },
                { id: 'invoices', name: 'Invoices', count: dashboardData.invoices },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                {dashboardData.ordersData?.customer?.orders?.edges?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.ordersData.customer.orders.edges.map((edge: any) => {
                          const order = edge.node;
                          const lineItems = order.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges || [];
                          return (
                            <tr key={order.entityId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <a 
                                  href={`/custom-dashboard/orders/${order.entityId}`}
                                  className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                >
                                  #{order.entityId}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(order.orderedAt.utc)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status.value)}`}>
                                  {order.status.value.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(order.totalIncTax.value)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No orders found.</p>
                )}
              </div>
            )}

            {activeTab === 'quotes' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Quotes</h3>
                {dashboardData.quotesData?.quotes?.edges?.length > 0 ? (
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.quotesData.quotes.edges.map((edge: any) => {
                          const quote = edge.node;
                          return (
                            <tr key={quote.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{quote.id}
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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No quotes found.</p>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
                {dashboardData.invoicesData?.customer?.orders?.edges?.length > 0 ? (
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.invoicesData.customer.orders.edges.map((edge: any) => {
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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No invoices found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Debug Components */}
        <div className="mt-6 space-y-4">
          <ApiDebugger />
          {/* Temporarily commenting out debug components to isolate issues
          <AuthDebugger />
          <B2BLoginTrigger />
          <B3StorageDebugger />
          <B3StorageInitializer />
          */}
          {/* Temporarily commenting out the new B2B components
          <B2BAuthDebugger />
          */}
        </div>
      </div>
    </div>
  );
} 