/**
 * Custom B2B Dashboard - New Implementation
 * 
 * This component uses the new B2B client with gql-tada instead of
 * relying on B2B buyer portal or B3Storage dependencies.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getCustomerInfo, 
  getOrders, 
  getQuotes, 
  getInvoices, 
  searchProducts 
} from '~/b2b/server-actions-new';
import { B2BNavigation } from './B2BNavigation';
import { ApiDebugger } from './ApiDebugger';

// Types
interface DashboardData {
  customer: any;
  orders: any;
  quotes: any;
  invoices: any;
}

interface LoadingState {
  customer: boolean;
  orders: boolean;
  quotes: boolean;
  invoices: boolean;
}

interface ErrorState {
  customer: string | null;
  orders: string | null;
  quotes: string | null;
  invoices: string | null;
}

export function CustomB2BDashboard() {
  const [data, setData] = useState<DashboardData>({
    customer: null,
    orders: null,
    quotes: null,
    invoices: null,
  });
  
  const [loading, setLoading] = useState<LoadingState>({
    customer: true,
    orders: true,
    quotes: true,
    invoices: true,
  });
  
  const [errors, setErrors] = useState<ErrorState>({
    customer: null,
    orders: null,
    quotes: null,
    invoices: null,
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    console.log('🔄 [Dashboard] Loading dashboard data...');

    try {
      // Load all data in parallel
      const [customerResult, ordersResult, quotesResult, invoicesResult] = await Promise.all([
        getCustomerInfo().catch(err => {
          console.error('❌ [Dashboard] Customer info error:', err);
          return { customer: null, error: err.message };
        }),
        getOrders(50).catch(err => {
          console.error('❌ [Dashboard] Orders error:', err);
          return { orders: null, error: err.message };
        }),
        getQuotes().catch(err => {
          console.error('❌ [Dashboard] Quotes error:', err);
          return { quotes: { edges: [] }, error: err.message };
        }),
        getInvoices(50).catch(err => {
          console.error('❌ [Dashboard] Invoices error:', err);
          return { invoices: null, error: err.message };
        }),
      ]);

      // Update data
      setData({
        customer: customerResult.customer,
        orders: ordersResult.orders,
        quotes: quotesResult.quotes,
        invoices: invoicesResult.invoices,
      });

      // Update loading states
      setLoading({
        customer: false,
        orders: false,
        quotes: false,
        invoices: false,
      });

      // Update error states
      setErrors({
        customer: customerResult.error,
        orders: ordersResult.error,
        quotes: quotesResult.error,
        invoices: invoicesResult.error,
      });

      console.log('✅ [Dashboard] Data loaded successfully');
    } catch (error) {
      console.error('❌ [Dashboard] Error loading dashboard data:', error);
      
      // Set all loading to false and show errors
      setLoading({
        customer: false,
        orders: false,
        quotes: false,
        invoices: false,
      });
      
      setErrors({
        customer: 'Failed to load dashboard data',
        orders: 'Failed to load dashboard data',
        quotes: 'Failed to load dashboard data',
        invoices: 'Failed to load dashboard data',
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Utility functions
  const formatPrice = (price: { value: number; currencyCode: string }) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode,
    }).format(price.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'AWAITING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'AWAITING_FULFILLMENT': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading component
  if (loading.customer && loading.orders && loading.quotes && loading.invoices) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <B2BNavigation />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading B2B Dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <B2BNavigation />
      
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">B2B Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {data.customer?.firstName || 'Customer'}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Customer Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {data.customer?.firstName?.[0] || 'C'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Customer
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data.customer?.firstName} {data.customer?.lastName}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {data.customer?.company || 'No company'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data.orders?.edges?.length || 0}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Recent orders
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Quotes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data.quotes?.edges?.length || 0}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Active quotes
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Invoices
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data.invoices?.edges?.length || 0}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Recent invoices
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(errors.customer || errors.orders || errors.quotes || errors.invoices) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Some data could not be loaded
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.customer && <li>Customer information: {errors.customer}</li>}
                      {errors.orders && <li>Orders: {errors.orders}</li>}
                      {errors.quotes && <li>Quotes: {errors.quotes}</li>}
                      {errors.invoices && <li>Invoices: {errors.invoices}</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Orders
                </h3>
                <Link 
                  href="/custom-dashboard/orders"
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
              
              {loading.orders ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : errors.orders ? (
                <div className="text-center py-4 text-red-600">
                  Failed to load orders: {errors.orders}
                </div>
              ) : data.orders?.edges?.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
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
                      {data.orders.edges.slice(0, 5).map(({ node: order }: any) => (
                        <tr key={order.entityId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/custom-dashboard/orders/${order.entityId}`}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              #{order.entityId}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(order.orderedAt.utc)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status.value)}`}>
                              {order.status.value.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(order.totalIncTax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges?.length || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Invoices
                </h3>
                <Link 
                  href="/custom-dashboard/invoices"
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
              
              {loading.invoices ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : errors.invoices ? (
                <div className="text-center py-4 text-red-600">
                  Failed to load invoices: {errors.invoices}
                </div>
              ) : data.invoices?.edges?.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
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
                      {data.invoices.edges.slice(0, 5).map(({ node: invoice }: any) => (
                        <tr key={invoice.entityId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/custom-dashboard/invoices/${invoice.entityId}`}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              #{invoice.entityId}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.orderedAt.utc)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status.value)}`}>
                              {invoice.status.value.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(invoice.totalIncTax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges?.length || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No invoices found</p>
                </div>
              )}
            </div>
          </div>

          {/* Debug Section */}
          <div className="mt-6 space-y-4">
            <ApiDebugger />
          </div>
        </div>
      </main>
    </div>
  );
} 