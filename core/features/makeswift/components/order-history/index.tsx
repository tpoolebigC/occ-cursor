'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, Copy } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: {
    amount: number;
    currencyCode: string;
  };
  createdAt: string;
  updatedAt: string;
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: {
          amount: number;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface OrderHistoryProps {
  className?: string;
  customerId?: string | null;
  limit?: string;
  showStatus?: boolean;
  showPricing?: boolean;
  showDate?: boolean;
  showOrderNumber?: boolean;
  statusFilter?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export function OrderHistory({
  className = '',
  customerId,
  limit = '10',
  showStatus = true,
  showPricing = true,
  showDate = true,
  showOrderNumber = true,
  statusFilter = '',
  dateRange,
}: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          customerId,
          limit: (parseInt(limit) || 10).toString(),
          ...(statusFilter && { status: statusFilter }),
          ...(dateRange?.startDate && { startDate: dateRange.startDate }),
          ...(dateRange?.endDate && { endDate: dateRange.endDate }),
        });

        const response = await fetch(`/api/b2b/orders?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [customerId, limit, statusFilter, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  if (!customerId) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        Please select a customer to view order history
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-center text-red-600 ${className}`}>
        Error: {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No orders found for this customer
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {showOrderNumber && (
                    <span className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </span>
                  )}
                  {showStatus && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  )}
                  {showDate && (
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  )}
                </div>

                {showPricing && (
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount.amount, order.totalAmount.currencyCode)}
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-600">
                  {order.lineItems.edges.length} item{order.lineItems.edges.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  title="View order details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  title="Copy order number"
                  onClick={() => navigator.clipboard.writeText(order.orderNumber)}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 