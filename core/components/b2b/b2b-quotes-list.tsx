'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Quote } from '~/lib/b2b/client';

interface B2BQuotesListProps {
  quotes: Quote[];
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
};

const statusIcons = {
  draft: DocumentDuplicateIcon,
  pending: ClockIcon,
  approved: CheckIcon,
  rejected: XMarkIcon,
  expired: XMarkIcon,
};

export function B2BQuotesList({ quotes }: B2BQuotesListProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new quote.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <div
          key={quote.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Quote #{quote.id}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[quote.status as keyof typeof statusColors] || statusColors.draft
                  }`}
                >
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Customer:</span> {quote.customerEmail}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{' '}
                  ${quote.total.toFixed(2)} {quote.currencyCode}
                </div>
              </div>

              {quote.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {quote.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500">({item.productSku})</span>
                        <span className="text-gray-600">
                          ${item.salePrice.toFixed(2)} each
                        </span>
                      </div>
                    ))}
                    {quote.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{quote.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {quote.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                  <p className="text-sm text-gray-600">{quote.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setSelectedQuote(quote)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="View details"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit quote"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete quote"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Quote #{selectedQuote.id} Details
                </h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedQuote.status as keyof typeof statusColors] || statusColors.draft
                    }`}>
                      {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span> {selectedQuote.customerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(selectedQuote.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>{' '}
                    ${selectedQuote.total.toFixed(2)} {selectedQuote.currencyCode}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Items:</h3>
                  <div className="space-y-2">
                    {selectedQuote.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">SKU: {item.productSku}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-sm text-gray-500">
                              Options: {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity}x</div>
                          <div className="text-sm text-gray-600">
                            ${item.salePrice.toFixed(2)} each
                          </div>
                          <div className="text-sm font-medium">
                            ${item.extendedSalePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQuote.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes:</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedQuote.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 