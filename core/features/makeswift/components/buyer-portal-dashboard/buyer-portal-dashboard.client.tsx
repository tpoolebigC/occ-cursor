'use client';

import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { CustomerSelector } from '../customer-selector';
import { OrderHistory } from '../order-history';
import { BuyerPortalStats } from '../buyer-portal-stats';
import { BuyerPortalQuickActions } from '../buyer-portal-quick-actions';

interface BuyerPortalDashboardProps {
  title?: string;
  subtitle?: string;
  showCustomerSelector?: boolean;
  showOrderHistory?: boolean;
  showQuickActions?: boolean;
  showStats?: boolean;
  orderHistoryLimit?: number;
  statsColumns?: number;
}

export function BuyerPortalDashboardClient({
  title = 'Buyer Portal Dashboard',
  subtitle = 'Manage your B2B customers, orders, and quotes',
  showCustomerSelector = true,
  showOrderHistory = true,
  showQuickActions = true,
  showStats = true,
  orderHistoryLimit = 5,
  statsColumns = 4,
}: BuyerPortalDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Customer Selection */}
      {showCustomerSelector && (
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
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Order History */}
        {showOrderHistory && (
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
            <Suspense fallback={<div>Loading orders...</div>}>
              <OrderHistory
                customerId="1"
                limit={orderHistoryLimit.toString()}
                showStatus={true}
                showPricing={true}
                showDate={true}
                showOrderNumber={true}
              />
            </Suspense>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <BuyerPortalQuickActions />
          </div>
        )}
      </div>

      {/* Stats Overview */}
      {showStats && (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <BuyerPortalStats columns={statsColumns} />
        </div>
      )}
    </div>
  );
} 