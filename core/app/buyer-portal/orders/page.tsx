import { Suspense } from 'react';
import { OrderList } from '~/lib/makeswift/components/order-list';
import { OrderFilters } from '~/lib/makeswift/components/order-filters';
import { OrderSearch } from '~/lib/makeswift/components/order-search';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all customer orders
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OrderSearch
              placeholder="Search orders by number, customer, or product..."
              allowSearch={true}
            />
          </div>
          <div>
            <OrderFilters
              showStatusFilter={true}
              showDateFilter={true}
              showCustomerFilter={true}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Suspense fallback={<div className="p-6">Loading orders...</div>}>
          <OrderList
            customerId={null}
            limit="20"
            showStatus={true}
            showPricing={true}
            showDate={true}
            showOrderNumber={true}
            showCustomer={true}
            showActions={true}
            allowPagination={true}
            allowSorting={true}
          />
        </Suspense>
      </div>
    </div>
  );
} 