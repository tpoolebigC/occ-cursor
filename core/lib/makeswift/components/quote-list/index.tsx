'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  DocumentDuplicateIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Quote {
  id: string;
  quoteNumber: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected';
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
  totalAmount: {
    amount: number;
    currencyCode: string;
  };
  createdAt: string;
  expiresAt: string;
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

interface QuoteListProps {
  className?: string;
  customerId?: string | null;
  limit?: string;
  showStatus?: boolean;
  showPricing?: boolean;
  showDate?: boolean;
  showQuoteNumber?: boolean;
  showCustomer?: boolean;
  showExpiry?: boolean;
  showActions?: boolean;
  allowPagination?: boolean;
  allowSorting?: boolean;
  statusFilter?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

type SortField = 'quoteNumber' | 'customer' | 'status' | 'totalAmount' | 'createdAt' | 'expiresAt';
type SortDirection = 'asc' | 'desc';

export function QuoteList({
  className = '',
  customerId,
  limit = '20',
  showStatus = true,
  showPricing = true,
  showDate = true,
  showQuoteNumber = true,
  showCustomer = true,
  showExpiry = true,
  showActions = true,
  allowPagination = true,
  allowSorting = true,
  statusFilter = '',
  dateRange,
}: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          limit: (parseInt(limit) || 20).toString(),
          page: currentPage.toString(),
          sortField,
          sortDirection,
          ...(customerId && { customerId }),
          ...(statusFilter && { status: statusFilter }),
          ...(dateRange?.startDate && { startDate: dateRange.startDate }),
          ...(dateRange?.endDate && { endDate: dateRange.endDate }),
        });

        const response = await fetch(`/api/b2b/quotes?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const data = await response.json();
        setQuotes(data.quotes || []);
        setTotalPages(Math.ceil((data.totalCount || 0) / (parseInt(limit) || 20)));
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quotes');
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [customerId, limit, currentPage, sortField, sortDirection, statusFilter, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'expired':
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleSort = (field: SortField) => {
    if (!allowSorting) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (!allowSorting) return null;
    
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <ChevronUpIcon className="h-4 w-4" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" />
      );
    }
    return <ChevronUpIcon className="h-4 w-4 text-gray-300" />;
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center text-red-600 ${className}`}>
        Error: {error}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        No quotes found
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showQuoteNumber && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quoteNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Quote #</span>
                    <SortIcon field="quoteNumber" />
                  </div>
                </th>
              )}
              {showCustomer && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <SortIcon field="customer" />
                  </div>
                </th>
              )}
              {showStatus && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon field="status" />
                  </div>
                </th>
              )}
              {showPricing && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total</span>
                    <SortIcon field="totalAmount" />
                  </div>
                </th>
              )}
              {showDate && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <SortIcon field="createdAt" />
                  </div>
                </th>
              )}
              {showExpiry && (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('expiresAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Expires</span>
                    <SortIcon field="expiresAt" />
                  </div>
                </th>
              )}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                {showQuoteNumber && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{quote.quoteNumber}
                  </td>
                )}
                {showCustomer && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {quote.customer.firstName} {quote.customer.lastName}
                      </div>
                      {quote.customer.company && (
                        <div className="text-gray-500">{quote.customer.company}</div>
                      )}
                    </div>
                  </td>
                )}
                {showStatus && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(quote.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                  </td>
                )}
                {showPricing && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(quote.totalAmount.amount, quote.totalAmount.currencyCode)}
                  </td>
                )}
                {showDate && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(quote.createdAt)}
                  </td>
                )}
                {showExpiry && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className={`${isExpired(quote.expiresAt) ? 'text-red-600 font-medium' : ''}`}>
                      {formatDate(quote.expiresAt)}
                    </div>
                  </td>
                )}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="View quote details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy quote number"
                        onClick={() => navigator.clipboard.writeText(quote.quoteNumber)}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {allowPagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 