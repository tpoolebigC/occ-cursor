import { Suspense } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { CustomerSelector } from '~/lib/makeswift/components/customer-selector';
import { OrderHistory } from '~/lib/makeswift/components/order-history';

export default function BuyerPortalDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Portal Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your B2B customers, orders, and quotes
        </p>
      </div>

      {/* Customer Selection */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Customer</h2>
        <div className="max-w-md">
          <CustomerSelector
            placeholder="Choose a customer to view their data..."
            showCompany={true}
            showEmail={false}
            allowSearch={true}
            limit="10"
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Order History */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrderHistory
              customerId="1"
              limit="5"
              showStatus={true}
              showPricing={true}
              showDate={true}
              showOrderNumber={true}
            />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Create New Quote</div>
                <div className="text-sm text-gray-500">Request pricing for products</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-blue-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Browse Catalog</div>
                <div className="text-sm text-gray-500">View available products</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-blue-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Account Settings</div>
                <div className="text-sm text-gray-500">Manage customer information</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
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