'use client';

import { useState } from 'react';
import { getCustomerInfo, getOrders, getQuotes, getInvoices } from '~/b2b/server-actions';

export function ApiDebugger() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testApiCalls = async () => {
    setLoading(true);
    try {
      console.log('Testing API calls...');
      
      const [customerResult, ordersResult, quotesResult, invoicesResult] = await Promise.all([
        getCustomerInfo(),
        getOrders(50),
        getQuotes(),
        getInvoices(50),
      ]);

      const debugResults = {
        customer: {
          hasError: !!customerResult.error,
          error: customerResult.error,
          hasCustomer: !!customerResult.customer,
          customerData: customerResult.customer,
        },
        orders: {
          hasError: !!ordersResult.error,
          error: ordersResult.error,
          hasCustomer: !!ordersResult.customer,
          hasOrders: !!ordersResult.customer?.orders,
          orderCount: ordersResult.customer?.orders?.edges?.length || 0,
          pageInfo: ordersResult.customer?.orders?.pageInfo,
          ordersData: ordersResult.customer?.orders?.edges || [],
        },
        quotes: {
          hasError: !!quotesResult.error,
          error: quotesResult.error,
          hasQuotes: !!quotesResult.quotes,
          quoteCount: quotesResult.quotes?.edges?.length || 0,
          quotesData: quotesResult.quotes?.edges || [],
        },
        invoices: {
          hasError: !!invoicesResult.error,
          error: invoicesResult.error,
          hasCustomer: !!invoicesResult.customer,
          hasOrders: !!invoicesResult.customer?.orders,
          invoiceCount: invoicesResult.customer?.orders?.edges?.length || 0,
          invoicesData: invoicesResult.customer?.orders?.edges || [],
        },
      };

      console.log('API Debug Results:', debugResults);
      setResults(debugResults);
    } catch (error) {
      console.error('Error testing API calls:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">API Debugger</h3>
      
      <button
        onClick={testApiCalls}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Calls'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {results.error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-600">{results.error}</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-800">Customer Info</h4>
                <pre className="text-sm text-blue-700 mt-2 overflow-auto">
                  {JSON.stringify(results.customer, null, 2)}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-semibold text-green-800">Orders</h4>
                <pre className="text-sm text-green-700 mt-2 overflow-auto">
                  {JSON.stringify(results.orders, null, 2)}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold text-yellow-800">Quotes</h4>
                <pre className="text-sm text-yellow-700 mt-2 overflow-auto">
                  {JSON.stringify(results.quotes, null, 2)}
                </pre>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded p-4">
                <h4 className="font-semibold text-purple-800">Invoices</h4>
                <pre className="text-sm text-purple-700 mt-2 overflow-auto">
                  {JSON.stringify(results.invoices, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 