import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { notFound } from 'next/navigation';

import { getPageSnapshot } from '~/lib/makeswift/client';

export default async function BuyerPortalPage() {
  // Try to get the Makeswift page snapshot for the buyer portal
  const snapshot = await getPageSnapshot({ 
    path: '/buyer-portal', 
    locale: 'en' 
  });

  if (snapshot) {
    // If a Makeswift page exists, render it
    return <MakeswiftPage snapshot={snapshot} />;
  }

  // Fallback to the default buyer portal dashboard
  // This ensures the page works even without a Makeswift snapshot
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Portal Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your B2B customers, orders, and quotes
        </p>
      </div>

      {/* Instructions for Makeswift setup */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          Make This Page Editable in Makeswift
        </h2>
        <p className="text-blue-700 mb-4">
          To customize this page in Makeswift:
        </p>
        <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
          <li>Go to your Makeswift dashboard</li>
          <li>Create a new page with path "/buyer-portal"</li>
          <li>Add the "Buyer Portal Dashboard" component</li>
          <li>Customize the layout and content</li>
          <li>Publish the page</li>
        </ol>
      </div>

      {/* Default Dashboard Content */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Customer</h2>
        <div className="max-w-md">
          <div className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
            Choose a customer to view their data...
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
          <div className="text-gray-500">Loading orders...</div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900">Create New Quote</div>
              <div className="text-sm text-gray-500">Request pricing for products</div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900">Browse Catalog</div>
              <div className="text-sm text-gray-500">View available products</div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900">Account Settings</div>
              <div className="text-sm text-gray-500">Manage customer information</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-500">Active Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$12,450</div>
            <div className="text-sm text-gray-500">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-gray-500">Pending Quotes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">15</div>
            <div className="text-sm text-gray-500">Total Products</div>
          </div>
        </div>
      </div>
    </div>
  );
} 