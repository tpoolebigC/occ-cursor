'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  FileText 
} from 'lucide-react';

interface QuoteStatsProps {
  className?: string;
  showPending?: boolean;
  showApproved?: boolean;
  showExpired?: boolean;
  showTotal?: boolean;
  customerId?: string | null;
}

interface QuoteStats {
  pending: number;
  approved: number;
  expired: number;
  total: number;
  totalValue: number;
}

export function QuoteStats({
  className = '',
  showPending = true,
  showApproved = true,
  showExpired = true,
  showTotal = true,
  customerId,
}: QuoteStatsProps) {
  const [stats, setStats] = useState<QuoteStats>({
    pending: 0,
    approved: 0,
    expired: 0,
    total: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (customerId) {
          params.append('customerId', customerId);
        }

        const response = await fetch(`/api/b2b/quotes/stats?${params}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching quote stats:', error);
        // Use mock data for now
        setStats({
          pending: 8,
          approved: 12,
          expired: 3,
          total: 23,
          totalValue: 45600,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [customerId]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {showPending && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        )}

        {showApproved && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
            </div>
          </div>
        )}

        {showExpired && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Expired</p>
                <p className="text-2xl font-bold text-red-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        )}

        {showTotal && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Total Value</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 