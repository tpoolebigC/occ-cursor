/**
 * B3ProductList Component
 * 
 * Displays products consistently throughout the Order Management system.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React from 'react';
import { OrderProductItem } from '../types';

interface B3ProductListProps {
  products: OrderProductItem[];
  display?: {
    showImages?: boolean;
    showSku?: boolean;
    showOptions?: boolean;
    showPricing?: boolean;
    showQuantity?: boolean;
    showTotal?: boolean;
    showDiscounts?: boolean;
  };
  variant?: 'table' | 'card' | 'compact';
  isLoading?: boolean;
  currencyCode?: string;
}

export function B3ProductList({
  products,
  display = {
    showImages: true,
    showSku: true,
    showOptions: true,
    showPricing: true,
    showQuantity: true,
    showTotal: true,
    showDiscounts: true,
  },
  variant = 'table',
  isLoading = false,
  currencyCode = 'USD',
}: B3ProductListProps) {
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">No products are available to display.</p>
      </div>
    );
  }

  // Table variant
  if (variant === 'table') {
    return (
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
              {display.showQuantity && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              )}
              {display.showPricing && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
              )}
              {display.showTotal && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                {display.showImages && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
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
                  {product.variant_id && (
                    <div className="text-sm text-gray-500">
                      Variant ID: {product.variant_id}
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
                    {product.product_options && product.product_options.length > 0 ? (
                      <div className="space-y-1">
                        {product.product_options.map((option) => (
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
                
                {display.showQuantity && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.quantity}
                  </td>
                )}
                
                {display.showPricing && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price_inc_tax)}
                  </td>
                )}
                
                {display.showTotal && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(product.total_inc_tax)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {display.showImages && (
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {product.name}
              </h3>
              
              {display.showSku && (
                <p className="text-sm text-gray-500 mb-2">
                  SKU: {product.sku}
                </p>
              )}
              
              {display.showOptions && product.product_options && product.product_options.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Options:</h4>
                  <div className="space-y-1">
                    {product.product_options.map((option) => (
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
                </div>
              )}
              
              <div className="flex justify-between items-center">
                {display.showQuantity && (
                  <span className="text-sm text-gray-500">
                    Qty: {product.quantity}
                  </span>
                )}
                
                {display.showPricing && (
                  <span className="text-lg font-medium text-gray-900">
                    {formatPrice(product.price_inc_tax)}
                  </span>
                )}
              </div>
              
              {display.showTotal && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.total_inc_tax)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Compact variant
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
          {display.showImages && (
            <div className="flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h4>
            
            {display.showSku && (
              <p className="text-sm text-gray-500">
                SKU: {product.sku}
              </p>
            )}
            
            {display.showOptions && product.product_options && product.product_options.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {product.product_options.map((option, index) => (
                  <span key={option.id}>
                    {option.name}: {option.value}
                    {index < product.product_options!.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 text-right">
            {display.showQuantity && (
              <div className="text-sm text-gray-500">
                Qty: {product.quantity}
              </div>
            )}
            
            {display.showPricing && (
              <div className="text-sm font-medium text-gray-900">
                {formatPrice(product.price_inc_tax)}
              </div>
            )}
            
            {display.showTotal && (
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(product.total_inc_tax)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default B3ProductList; 