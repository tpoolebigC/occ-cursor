'use client';

import { useState } from 'react';
import { useB2BStats } from '~/shared/hooks/use-b2b-data';

interface B2BStats {
  activeOrders: number;
  monthlyRevenue: string;
  pendingQuotes: number;
  totalProducts: number;
}

interface BuyerPortalStatsProps {
  columns?: 2 | 3 | 4;
  showActiveOrders?: boolean;
  showMonthlyRevenue?: boolean;
  showPendingQuotes?: boolean;
  showTotalProducts?: boolean;
  activeOrdersCount?: number;
  monthlyRevenue?: string;
  pendingQuotesCount?: number;
  totalProductsCount?: number;
  customerId?: string;
}

export function BuyerPortalStatsClient({
  columns = 4,
  showActiveOrders = true,
  showMonthlyRevenue = true,
  showPendingQuotes = true,
  showTotalProducts = true,
  activeOrdersCount = 3,
  monthlyRevenue = '$12,450',
  pendingQuotesCount = 2,
  totalProductsCount = 15,
  customerId,
}: BuyerPortalStatsProps) {
  // Use optimized SWR hook instead of useEffect
  const { stats, isLoading, error } = useB2BStats(customerId);

  // Use API data if available, fallback to props
  const displayStats = {
    activeOrders: stats.activeOrders || activeOrdersCount,
    monthlyRevenue: stats.monthlyRevenue || monthlyRevenue,
    pendingQuotes: stats.pendingQuotes || pendingQuotesCount,
    totalProducts: stats.totalProducts || totalProductsCount,
  };

  const gridCols = columns === 2 ? 'grid-cols-2' : 
                   columns === 3 ? 'grid-cols-3' : 
                   columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 
                   'grid-cols-2 md:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-4 animate-pulse`}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Failed to fetch B2B stats:', error);
  }

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {showActiveOrders && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {displayStats.activeOrders}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayStats.activeOrders}
              </p>
            </div>
          </div>
        </div>
      )}

      {showMonthlyRevenue && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">$</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayStats.monthlyRevenue}
              </p>
            </div>
          </div>
        </div>
      )}

      {showPendingQuotes && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold text-sm">
                  {displayStats.pendingQuotes}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Quotes</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayStats.pendingQuotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {showTotalProducts && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">
                  {displayStats.totalProducts}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayStats.totalProducts}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 