'use client';

import { useState } from 'react';

interface QuickOrderPadProps {
  onAddBySku: (sku: string, quantity: number) => void;
}

export default function QuickOrderPad({ onAddBySku }: QuickOrderPadProps) {
  const [skuInput, setSkuInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAdd = async () => {
    if (!skuInput.trim()) return;

    setIsProcessing(true);
    try {
      const quantity = parseInt(quantityInput) || 1;
      await onAddBySku(skuInput.trim(), quantity);
      
      // Clear inputs after successful add
      setSkuInput('');
      setQuantityInput('1');
    } catch (error) {
      console.error('Error adding product by SKU:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add by SKU</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="sku-input" className="block text-sm font-medium text-gray-700 mb-2">
            Product SKU
          </label>
          <input
            id="sku-input"
            type="text"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter product SKU..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            id="quantity-input"
            type="number"
            min="1"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!skuInput.trim() || isProcessing}
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isProcessing ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Enter the exact SKU from your product catalog</li>
          <li>• Press Enter to quickly add products</li>
          <li>• Use this for frequently ordered items</li>
        </ul>
      </div>
    </div>
  );
} 