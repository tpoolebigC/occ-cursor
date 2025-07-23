'use client';

import { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface QuoteFiltersProps {
  className?: string;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showCustomerFilter?: boolean;
  showExpiryFilter?: boolean;
  onFiltersChange?: (filters: any) => void;
}

export function QuoteFilters({
  className = '',
  showStatusFilter = true,
  showDateFilter = true,
  showCustomerFilter = true,
  showExpiryFilter = true,
  onFiltersChange,
}: QuoteFiltersProps) {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    customer: '',
    expiry: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <FunnelIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>

      {showStatusFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {showDateFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      )}

      {showCustomerFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={filters.customer}
            onChange={(e) => handleFilterChange('customer', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Customers</option>
            <option value="acme">Acme Corp</option>
            <option value="enterprise">Enterprise Inc</option>
            <option value="retail">Retail Solutions</option>
          </select>
        </div>
      )}

      {showExpiryFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Expiry
          </label>
          <select
            value={filters.expiry}
            onChange={(e) => handleFilterChange('expiry', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Quotes</option>
            <option value="expired">Expired</option>
            <option value="expiring_soon">Expiring Soon (7 days)</option>
            <option value="active">Active</option>
          </select>
        </div>
      )}
    </div>
  );
} 