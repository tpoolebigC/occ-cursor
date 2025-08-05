/**
 * QuoteDetailFooter Component
 * 
 * Handles quote actions like checkout, approval, rejection, and PDF export.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React, { useState } from 'react';
import { QuoteDetail, QuoteStatus } from '../types';
import { 
  approveQuote, 
  rejectQuote, 
  deleteQuote, 
  checkoutQuote, 
  exportQuotePdf 
} from '../services/quoteApi';
import { useB2BPermission } from '../../hooks/useB2BAuth';

interface QuoteDetailFooterProps {
  quote: QuoteDetail;
  onQuoteUpdate?: (quote: QuoteDetail) => void;
  onQuoteDelete?: () => void;
  onCheckoutSuccess?: (checkoutUrl: string) => void;
  onCheckoutError?: (error: string) => void;
}

export function QuoteDetailFooter({
  quote,
  onQuoteUpdate,
  onQuoteDelete,
  onCheckoutSuccess,
  onCheckoutError,
}: QuoteDetailFooterProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Check permissions
  const canApprove = useB2BPermission('quotes_approve');
  const canReject = useB2BPermission('quotes_reject');
  const canDelete = useB2BPermission('quotes_delete');
  const canConvertToOrder = useB2BPermission('quotes_convert_to_order');
  const canExportPdf = useB2BPermission('quotes_export_pdf');

  // Handle quote approval
  const handleApprove = async () => {
    if (!approvalNotes.trim()) {
      alert('Please provide approval notes');
      return;
    }

    setIsLoading('approve');
    try {
      const response = await approveQuote(quote.id!, approvalNotes);
      
      if (response.success && response.data) {
        onQuoteUpdate?.(response.data);
        setShowApprovalModal(false);
        setApprovalNotes('');
      } else {
        alert(`Failed to approve quote: ${response.error}`);
      }
    } catch (error) {
      console.error('Error approving quote:', error);
      alert('An error occurred while approving the quote');
    } finally {
      setIsLoading(null);
    }
  };

  // Handle quote rejection
  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }

    setIsLoading('reject');
    try {
      const response = await rejectQuote(quote.id!, rejectionNotes);
      
      if (response.success && response.data) {
        onQuoteUpdate?.(response.data);
        setShowRejectionModal(false);
        setRejectionNotes('');
      } else {
        alert(`Failed to reject quote: ${response.error}`);
      }
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('An error occurred while rejecting the quote');
    } finally {
      setIsLoading(null);
    }
  };

  // Handle quote deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    setIsLoading('delete');
    try {
      const response = await deleteQuote(quote.id!);
      
      if (response.success) {
        onQuoteDelete?.();
      } else {
        alert(`Failed to delete quote: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('An error occurred while deleting the quote');
    } finally {
      setIsLoading(null);
    }
  };

  // Handle quote checkout
  const handleCheckout = async () => {
    setIsLoading('checkout');
    try {
      const response = await checkoutQuote({ quoteId: quote.id! });
      
      if (response.success && response.data?.checkoutUrl) {
        onCheckoutSuccess?.(response.data.checkoutUrl);
        // Optionally redirect to checkout
        window.open(response.data.checkoutUrl, '_blank');
      } else {
        const error = response.error || 'Failed to initiate checkout';
        onCheckoutError?.(error);
        alert(error);
      }
    } catch (error) {
      console.error('Error checking out quote:', error);
      const errorMessage = 'An error occurred while processing checkout';
      onCheckoutError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  // Handle PDF export
  const handleExportPdf = async () => {
    setIsLoading('export');
    try {
      const response = await exportQuotePdf(quote.id!);
      
      if (response.success && response.data?.url) {
        // Open PDF in new tab
        window.open(response.data.url, '_blank');
      } else {
        alert(`Failed to export PDF: ${response.error}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('An error occurred while exporting the PDF');
    } finally {
      setIsLoading(null);
    }
  };

  // Check if quote can be converted to order
  const canConvert = quote.status === QuoteStatus.APPROVED && 
                    quote.permissions.canConvertToOrder && 
                    canConvertToOrder &&
                    quote.products.every(product => product.isAvailable && product.isPurchasable);

  // Check if quote can be approved/rejected
  const canApproveReject = quote.status === QuoteStatus.PENDING && 
                          (canApprove || canReject);

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-5 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        {/* Left side - Status and info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Quote #{quote.referenceNumber || quote.id}
          </div>
          <div className="text-sm text-gray-500">
            Total: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: quote.currency || 'USD',
            }).format(quote.total)}
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-wrap items-center space-x-3">
          {/* Export PDF */}
          {canExportPdf && (
            <button
              onClick={handleExportPdf}
              disabled={isLoading === 'export'}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading === 'export' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export PDF
            </button>
          )}

          {/* Convert to Order */}
          {canConvert && (
            <button
              onClick={handleCheckout}
              disabled={isLoading === 'checkout'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading === 'checkout' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              )}
              Convert to Order
            </button>
          )}

          {/* Approve Quote */}
          {canApprove && quote.status === QuoteStatus.PENDING && (
            <button
              onClick={() => setShowApprovalModal(true)}
              disabled={isLoading === 'approve'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading === 'approve' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Approve
            </button>
          )}

          {/* Reject Quote */}
          {canReject && quote.status === QuoteStatus.PENDING && (
            <button
              onClick={() => setShowRejectionModal(true)}
              disabled={isLoading === 'reject'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading === 'reject' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Reject
            </button>
          )}

          {/* Delete Quote */}
          {canDelete && quote.status === QuoteStatus.DRAFT && (
            <button
              onClick={handleDelete}
              disabled={isLoading === 'delete'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading === 'delete' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Quote</h3>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Enter approval notes (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isLoading === 'approve'}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Quote</h3>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Enter rejection reason (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading === 'reject'}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteDetailFooter; 