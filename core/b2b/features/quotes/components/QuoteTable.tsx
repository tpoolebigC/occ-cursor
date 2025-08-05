/**
 * QuoteTable Component
 * 
 * Displays products in a quote with quantity adjustment and option modification.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { QuoteProduct, QuoteProductOption } from '../types';
import { updateQuoteProduct, removeProductFromQuote } from '../services/quoteApi';

interface QuoteTableProps {
  products: QuoteProduct[];
  quoteId: number;
  onProductUpdate?: (product: QuoteProduct) => void;
  onProductRemove?: (productId: number) => void;
  display?: {
    showImages?: boolean;
    showSku?: boolean;
    showOptions?: boolean;
    showInventory?: boolean;
    showPricing?: boolean;
    showActions?: boolean;
  };
  isEditable?: boolean;
  isLoading?: boolean;
}

export function QuoteTable({
  products,
  quoteId,
  onProductUpdate,
  onProductRemove,
  display = {
    showImages: true,
    showSku: true,
    showOptions: true,
    showInventory: true,
    showPricing: true,
    showActions: true,
  },
  isEditable = true,
  isLoading = false,
}: QuoteTableProps) {
  const [updatingProducts, setUpdatingProducts] = useState<Set<number>>(new Set());
  const [removingProducts, setRemovingProducts] = useState<Set<number>>(new Set());

  // Handle quantity change
  const handleQuantityChange = useCallback(async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      return;
    }

    setUpdatingProducts(prev => new Set(prev).add(productId));

    try {
      const response = await updateQuoteProduct(quoteId, productId, { quantity: newQuantity });
      
      if (response.success && response.data) {
        onProductUpdate?.(response.data);
      } else {
        console.error('Failed to update product quantity:', response.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [quoteId, onProductUpdate]);

  // Handle product removal
  const handleRemoveProduct = useCallback(async (productId: number) => {
    if (!confirm('Are you sure you want to remove this product from the quote?')) {
      return;
    }

    setRemovingProducts(prev => new Set(prev).add(productId));

    try {
      const response = await removeProductFromQuote(quoteId, productId);
      
      if (response.success) {
        onProductRemove?.(productId);
      } else {
        console.error('Failed to remove product:', response.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error removing product:', error);
    } finally {
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [quoteId, onProductRemove]);

  // Format price
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Get status badge color
  const getStatusBadgeColor = (product: QuoteProduct) => {
    if (!product.isAvailable) return 'bg-red-100 text-red-800';
    if (!product.isPurchasable) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get status badge text
  const getStatusBadgeText = (product: QuoteProduct) => {
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

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products in quote</h3>
        <p className="text-gray-500">Add products to get started with your quote.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Quote Products ({products.length})
        </h3>
      </div>
      
      <div className="border-t border-gray-200">
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
                {display.showActions && isEditable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const isUpdating = updatingProducts.has(product.id);
                const isRemoving = removingProducts.has(product.id);
                
                return (
                  <tr key={product.id} className={isRemoving ? 'opacity-50' : ''}>
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
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditable ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={product.maxQuantity || 999}
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                            disabled={isUpdating}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {isUpdating && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900">{product.quantity}</span>
                      )}
                    </td>
                    
                    {display.showPricing && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {product.discountedPrice && product.discountedPrice < product.basePrice ? (
                              <>
                                <span className="line-through text-gray-500">
                                  {formatPrice(product.basePrice)}
                                </span>
                                <br />
                                <span className="text-red-600 font-medium">
                                  {formatPrice(product.discountedPrice)}
                                </span>
                              </>
                            ) : (
                              formatPrice(product.basePrice)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(product.lineTotal)}
                        </td>
                      </>
                    )}
                    
                    {display.showInventory && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(product)}`}>
                          {getStatusBadgeText(product)}
                        </span>
                        {product.inventoryLevel !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Stock: {product.inventoryLevel}
                          </div>
                        )}
                      </td>
                    )}
                    
                    {display.showActions && isEditable && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          disabled={isRemoving}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {isRemoving ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Removing...
                            </div>
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quote Summary */}
      {display.showPricing && (
        <div className="bg-gray-50 px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Subtotal ({products.length} items)
            </div>
            <div className="text-lg font-medium text-gray-900">
              {formatPrice(products.reduce((sum, product) => sum + product.lineTotal, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteTable; 