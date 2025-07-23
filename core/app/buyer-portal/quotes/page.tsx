import { Suspense } from 'react';
import { QuoteList } from '~/lib/makeswift/components/quote-list';
import { QuoteFilters } from '~/lib/makeswift/components/quote-filters';
import { QuoteSearch } from '~/lib/makeswift/components/quote-search';
import { QuoteStats } from '~/lib/makeswift/components/quote-stats';

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage customer quotes
        </p>
      </div>

      {/* Quote Statistics */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <Suspense fallback={<div>Loading stats...</div>}>
          <QuoteStats
            showPending={true}
            showApproved={true}
            showExpired={true}
            showTotal={true}
          />
        </Suspense>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <QuoteSearch
              placeholder="Search quotes by number, customer, or product..."
              allowSearch={true}
            />
          </div>
          <div>
            <QuoteFilters
              showStatusFilter={true}
              showDateFilter={true}
              showCustomerFilter={true}
              showExpiryFilter={true}
            />
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Suspense fallback={<div className="p-6">Loading quotes...</div>}>
          <QuoteList
            customerId={null}
            limit="20"
            showStatus={true}
            showPricing={true}
            showDate={true}
            showQuoteNumber={true}
            showCustomer={true}
            showExpiry={true}
            showActions={true}
            allowPagination={true}
            allowSorting={true}
          />
        </Suspense>
      </div>
    </div>
  );
} 