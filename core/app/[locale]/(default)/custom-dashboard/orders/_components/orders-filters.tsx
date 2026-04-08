'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface OrdersFiltersProps {
  currentQuery?: string;
  currentStatus?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}

const ORDER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Awaiting Payment', label: 'Awaiting Payment' },
  { value: 'Awaiting Fulfillment', label: 'Awaiting Fulfillment' },
  { value: 'Awaiting Shipment', label: 'Awaiting Shipment' },
  { value: 'Partially Shipped', label: 'Partially Shipped' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Refunded', label: 'Refunded' },
];

export function OrdersFilters({
  currentQuery,
  currentStatus,
  currentDateFrom,
  currentDateTo,
}: OrdersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(currentQuery ?? '');

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change
      params.delete('page');

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query || undefined });
  };

  const handleClearAll = () => {
    setQuery('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = currentQuery || currentStatus || currentDateFrom || currentDateTo;

  return (
    <div className="bg-white shadow rounded-lg mb-4">
      <div className="p-4 space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders by ID, PO#, company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Status filter */}
          <div className="min-w-[180px]">
            <label htmlFor="status-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={currentStatus ?? ''}
              onChange={(e) => updateParams({ status: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label htmlFor="date-from" className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={currentDateFrom ?? ''}
              onChange={(e) => updateParams({ dateFrom: e.target.value || undefined })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date to */}
          <div>
            <label htmlFor="date-to" className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={currentDateTo ?? ''}
              onChange={(e) => updateParams({ dateTo: e.target.value || undefined })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="h-0.5 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
