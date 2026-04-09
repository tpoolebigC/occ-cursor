'use client';

import { useState, useEffect } from 'react';
import { getCustomerInfo, getOrders, getQuotes, getB2BInvoices } from '~/b2b/server-actions';
import { B2BNavigation } from './B2BNavigation';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customerResult, ordersResult, quotesResult, invoicesResult] = await Promise.all([
        getCustomerInfo().catch(err => {
          console.error('[Dashboard] Customer info error:', err);
          return { customer: null, error: err.message };
        }),
        getOrders(50).catch(err => {
          console.error('[Dashboard] Orders error:', err);
          return { customer: null, error: err.message };
        }),
        getQuotes().catch(err => {
          console.error('[Dashboard] Quotes error:', err);
          return { quotes: [], error: err.message };
        }),
        getB2BInvoices().catch(err => {
          console.error('[Dashboard] Invoices error:', err);
          return { invoices: [], pagination: { totalCount: 0, offset: 0, limit: 25 }, error: err.message };
        }),
      ]);

      const customer = customerResult.customer;
      const orders = ordersResult.customer?.orders?.edges || [];
      const quotes = quotesResult.quotes || [];
      const invoices = invoicesResult.invoices || [];

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

    } catch (err) {
      console.error('[Dashboard] Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateValue: string | number | undefined | null) => {
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string | number | undefined) => {
    const s = String(status ?? '').toLowerCase();
    switch (s) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-shadow transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const customerName = [dashboardData.customer?.firstName, dashboardData.customer?.lastName]
    .filter(Boolean)
    .join(' ');
  const companyName = dashboardData.customer?.company;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <B2BNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back{customerName ? `, ${customerName}` : ''}
          </h1>
          {companyName && (
            <p className="mt-1 text-sm text-gray-500">{companyName}</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Orders</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.orders}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-highlight">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Total orders placed</p>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quotes</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.quotes}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-highlight">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Active quotes</p>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoices</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.invoices}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-highlight">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Total invoices</p>
          </button>
        </div>

        {/* Tab Navigation + Content */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-highlight text-primary'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
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
                                  className="text-primary hover:text-primary-shadow hover:underline"
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
                {(dashboardData.quotesData?.quotes?.length ?? 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quote #
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
                        {dashboardData.quotesData.quotes.map((quote: any) => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{quote.quoteNumber || quote.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(quote.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.statusLabel || quote.status)}`}>
                                  {quote.statusLabel || String(quote.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(quote.grandTotal ?? quote.subtotal ?? 0)}
                              </td>
                            </tr>
                          ))}
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
                {(dashboardData.invoicesData?.invoices?.length ?? 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice #
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
                            Due Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.invoicesData.invoices.map((invoice: any) => {
                          const invoiceStatusMap: Record<string, string> = {
                            '0': 'Open', '1': 'Partial', '2': 'Paid', '3': 'Overdue',
                          };
                          const statusDisplay = invoiceStatusMap[String(invoice.status)] || String(invoice.status);
                          const balanceValue = typeof invoice.originalBalance === 'object'
                            ? invoice.originalBalance?.value ?? 0
                            : Number(invoice.originalBalance) || 0;
                          return (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {invoice.invoiceNumber || `#${invoice.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(invoice.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(statusDisplay)}`}>
                                  {statusDisplay}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(balanceValue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {invoice.dueDate ? formatDate(invoice.dueDate) : '--'}
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

      </div>
    </div>
  );
}
