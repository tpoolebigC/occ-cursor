'use client';

import { useEffect, useState } from 'react';

interface BuyerPortalStatsProps {
  columns?: number;
  showActiveOrders?: boolean;
  showMonthlyRevenue?: boolean;
  showPendingQuotes?: boolean;
  showTotalProducts?: boolean;
  activeOrdersCount?: number;
  monthlyRevenue?: string;
  pendingQuotesCount?: number;
  totalProductsCount?: number;
}

interface B2BStats {
  activeOrders: number;
  monthlyRevenue: string;
  pendingQuotes: number;
  totalProducts: number;
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
}: BuyerPortalStatsProps) {
  const [stats, setStats] = useState<B2BStats>({
    activeOrders: activeOrdersCount,
    monthlyRevenue,
    pendingQuotes: pendingQuotesCount,
    totalProducts: totalProductsCount,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchB2BStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/b2b/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Fallback to default values if API fails
          setStats({
            activeOrders: activeOrdersCount,
            monthlyRevenue,
            pendingQuotes: pendingQuotesCount,
            totalProducts: totalProductsCount,
          });
        }
      } catch (error) {
        console.error('Failed to fetch B2B stats:', error);
        // Fallback to default values
        setStats({
          activeOrders: activeOrdersCount,
          monthlyRevenue,
          pendingQuotes: pendingQuotesCount,
          totalProducts: totalProductsCount,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchB2BStats();
  }, [activeOrdersCount, monthlyRevenue, pendingQuotesCount, totalProductsCount]);

  const gridCols = columns === 2 ? 'grid-cols-2' : 
                   columns === 3 ? 'grid-cols-3' : 
                   columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 
                   'grid-cols-2 md:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {showActiveOrders && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
          <div className="text-sm text-gray-500">Active Orders</div>
        </div>
      )}
      
      {showMonthlyRevenue && (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.monthlyRevenue}</div>
          <div className="text-sm text-gray-500">This Month</div>
        </div>
      )}
      
      {showPendingQuotes && (
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.pendingQuotes}</div>
          <div className="text-sm text-gray-500">Pending Quotes</div>
        </div>
      )}
      
      {showTotalProducts && (
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalProducts}</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
      )}
    </div>
  );
} 