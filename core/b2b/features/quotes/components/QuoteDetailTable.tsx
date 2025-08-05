/**
 * QuoteDetailTable Component
 * 
 * Displays products in a submitted quote with read-only view.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React from 'react';
import { QuoteProduct, QuoteDetail } from '../types';

interface QuoteDetailTableProps {
  quote: QuoteDetail;
  display?: {
    showImages?: boolean;
    showSku?: boolean;
    showOptions?: boolean;
    showInventory?: boolean;
    showPricing?: boolean;
    showTax?: boolean;
    showDiscounts?: boolean;
  };
  isLoading?: boolean;
}

export function QuoteDetailTable({
  quote,
  display = {
    showImages: true,
    showSku: true,
    showOptions: true,
    showInventory: true,
    showPricing: true,
    showTax: true,
    showDiscounts: true,
  },
  isLoading = false,
}: QuoteDetailTableProps) {
  // Format price
  const formatPrice = (price: number, currency: string = quote.currency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get product status badge color
  const getProductStatusBadgeColor = (product: QuoteProduct) => {
    if (!product.isAvailable) return 'bg-red-100 text-red-800';
    if (!product.isPurchasable) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get product status badge text
  const getProductStatusBadgeText = (product: QuoteProduct) => {
    if (!product.isAvailable) return 'Out of Stock';
    if (!product.isPurchasable) return 'Not Purchasable';
    return 'Available';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 mb-4 rounded"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-20 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Quote Header */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quote: {quote.title}
            </h3>
            {quote.referenceNumber && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Reference: {quote.referenceNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
              {quote.status.toUpperCase()}
            </span>
            <p className="mt-1 text-sm text-gray-500">
              Created: {quote.createdAt ? formatDate(quote.createdAt) : 'N/A'}
            </p>
            {quote.expiresAt && (
              <p className="text-sm text-gray-500">
                Expires: {formatDate(quote.expiresAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quote Information */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div>{quote.contactName}</div>
              <div>{quote.contactEmail}</div>
              {quote.contactPhone && <div>{quote.contactPhone}</div>}
              {quote.companyName && <div>{quote.companyName}</div>}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Quote Details</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div>Status: {quote.status}</div>
              <div>Created: {quote.createdAt ? formatDate(quote.createdAt) : 'N/A'}</div>
              {quote.updatedAt && <div>Updated: {formatDate(quote.updatedAt)}</div>}
              {quote.expiresAt && <div>Expires: {formatDate(quote.expiresAt)}</div>}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div>{quote.shippingAddress.firstName} {quote.shippingAddress.lastName}</div>
              {quote.shippingAddress.company && <div>{quote.shippingAddress.company}</div>}
              <div>{quote.shippingAddress.address1}</div>
              {quote.shippingAddress.address2 && <div>{quote.shippingAddress.address2}</div>}
              <div>{quote.shippingAddress.city}, {quote.shippingAddress.state} {quote.shippingAddress.postalCode}</div>
              <div>{quote.shippingAddress.country}</div>
              {quote.shippingAddress.phone && <div>Phone: {quote.shippingAddress.phone}</div>}
              {quote.shippingAddress.email && <div>Email: {quote.shippingAddress.email}</div>}
            </dd>
          </div>

          {!quote.useSameAddress && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Billing Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div>{quote.billingAddress.firstName} {quote.billingAddress.lastName}</div>
                {quote.billingAddress.company && <div>{quote.billingAddress.company}</div>}
                <div>{quote.billingAddress.address1}</div>
                {quote.billingAddress.address2 && <div>{quote.billingAddress.address2}</div>}
                <div>{quote.billingAddress.city}, {quote.billingAddress.state} {quote.billingAddress.postalCode}</div>
                <div>{quote.billingAddress.country}</div>
                {quote.billingAddress.phone && <div>Phone: {quote.billingAddress.phone}</div>}
                {quote.billingAddress.email && <div>Email: {quote.billingAddress.email}</div>}
              </dd>
            </div>
          )}

          {quote.customerNotes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Customer Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{quote.customerNotes}</dd>
            </div>
          )}

          {quote.internalNotes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Internal Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{quote.internalNotes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Products Table */}
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg leading-6 font-medium text-gray-900">
            Products ({quote.products.length})
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {display.showImages && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                {display.showSku && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                )}
                {display.showOptions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                {display.showPricing && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    {display.showDiscounts && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </>
                )}
                {display.showInventory && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.products.map((product) => (
                <tr key={product.id}>
                  {display.showImages && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                  )}
                  
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    {product.variantId && (
                      <div className="text-sm text-gray-500">
                        Variant ID: {product.variantId}
                      </div>
                    )}
                  </td>
                  
                  {display.showSku && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                  )}
                  
                  {display.showOptions && (
                    <td className="px-6 py-4">
                      {product.options && product.options.length > 0 ? (
                        <div className="space-y-1">
                          {product.options.map((option) => (
                            <div key={option.id} className="text-sm text-gray-600">
                              <span className="font-medium">{option.name}:</span> {option.value}
                              {option.price && option.price > 0 && (
                                <span className="text-gray-500 ml-1">
                                  (+{formatPrice(option.price)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No options</span>
                      )}
                    </td>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  
                  {display.showPricing && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.basePrice)}
                      </td>
                      {display.showDiscounts && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.discountedPrice && product.discountedPrice < product.basePrice ? (
                            <span className="text-red-600">
                              -{formatPrice(product.basePrice - product.discountedPrice)}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(product.lineTotal)}
                      </td>
                    </>
                  )}
                  
                  {display.showInventory && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductStatusBadgeColor(product)}`}>
                        {getProductStatusBadgeText(product)}
                      </span>
                      {product.inventoryLevel !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {product.inventoryLevel}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="bg-gray-50 px-4 py-5 sm:px-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal ({quote.products.length} items)</span>
            <span className="text-sm font-medium text-gray-900">{formatPrice(quote.subtotal)}</span>
          </div>
          
          {display.showTax && quote.taxTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Tax</span>
              <span className="text-sm font-medium text-gray-900">{formatPrice(quote.taxTotal)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(quote.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote History */}
      {quote.history && quote.history.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quote History
          </h4>
          <div className="space-y-3">
            {quote.history.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-gray-400 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(item.timestamp)}
                    {item.userName && ` by ${item.userName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteDetailTable; 