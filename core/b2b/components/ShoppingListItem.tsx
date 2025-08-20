'use client';

import { useState } from 'react';

interface ShoppingListItemProps {
  item: {
    entityId: number;
    productEntityId: number;
    quantity: number;
    product?: {
      name?: string;
      sku?: string;
      imageUrl?: string;
      price?: {
        value?: number;
        currencyCode?: string;
      };
    };
  };
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function ShoppingListItem({ item, onRemove, onUpdateQuantity }: ShoppingListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setLocalQuantity(newQuantity);
    setIsUpdating(true);
    
    try {
      await onUpdateQuantity(newQuantity);
    } catch (error) {
      // Revert on error
      setLocalQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(localQuantity + 1);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLocalQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    if (localQuantity !== item.quantity) {
      handleQuantityChange(localQuantity);
    }
  };

  const productName = item.product?.name || `Product ${item.productEntityId}`;
  const productSku = item.product?.sku || 'N/A';
  const productPrice = item.product?.price?.value;
  const productSalePrice = item.product?.salePrice?.value;
  const productImage = item.product?.imageUrl;
  const productBrand = item.product?.brand;

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 object-cover rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {productName}
            </h3>
            <p className="text-sm text-gray-500">SKU: {productSku}</p>
            {productBrand && (
              <p className="text-sm text-gray-500">Brand: {productBrand}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              {productPrice && (
                <span className="text-sm font-medium text-gray-900">
                  ${productPrice.toFixed(2)}
                </span>
              )}
              {productSalePrice && productSalePrice < (productPrice || 0) && (
                <span className="text-sm text-red-600 font-medium">
                  Sale: ${productSalePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          disabled={isUpdating || localQuantity <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <input
          type="number"
          min="1"
          value={localQuantity}
          onChange={handleQuantityInput}
          onBlur={handleQuantityBlur}
          disabled={isUpdating}
          className="w-16 h-8 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
        />
        
        <button
          onClick={handleIncrement}
          disabled={isUpdating}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={isUpdating}
        className="flex-shrink-0 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Loading Indicator */}
      {isUpdating && (
        <div className="flex-shrink-0">
          <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
} 