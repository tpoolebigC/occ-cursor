import { Suspense } from 'react';
import Link from 'next/link';
import { getEnrichedOrders, type EnrichedOrder } from '~/b2b/server-actions';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { OrdersTable } from './_components/orders-table';
import { OrdersFilters } from './_components/orders-filters';

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    orderBy?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function OrdersPage({ params: paramsPromise, searchParams }: OrdersPageProps) {
  const { locale } = await paramsPromise;
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const limit = parseInt(params.limit ?? '25', 10);
  const offset = (page - 1) * limit;

  const result = await getEnrichedOrders({
    q: params.q,
    status: params.status,
    offset,
    limit,
    orderBy: params.orderBy ?? '-createdAt',
    beginDateAt: params.dateFrom,
    endDateAt: params.dateTo,
  });

  const totalPages = Math.ceil((result.pagination.totalCount || 0) / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">
                View and manage your order history
                {result.pagination.totalCount > 0 && (
                  <span className="ml-1">
                    ({result.pagination.totalCount} total)
                  </span>
                )}
              </p>
            </div>
            <Link
              href={`/${locale}/custom-dashboard`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <OrdersFilters
          currentQuery={params.q}
          currentStatus={params.status}
          currentDateFrom={params.dateFrom}
          currentDateTo={params.dateTo}
        />

        {/* Error display */}
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
            <p className="text-sm text-red-600 mt-1">{result.error}</p>
          </div>
        )}

        {/* Orders Table */}
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable
            orders={result.orders}
            currentPage={page}
            totalPages={totalPages}
            totalCount={result.pagination.totalCount}
            limit={limit}
            orderBy={params.orderBy ?? 'createdAt'}
          />
        </Suspense>
      </div>
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
