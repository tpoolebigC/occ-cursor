'use client';

import { useState } from 'react';

interface OrderActionsProps {
  bcOrderId: number;
  products: Array<{
    productId: number;
    variantId?: number;
    name: string;
    sku: string;
    quantity: number;
  }>;
  hasShipment: boolean;
  locale: string;
}

export function OrderActions({ bcOrderId, products, hasShipment, locale }: OrderActionsProps) {
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  const handleReorder = async () => {
    try {
      setReordering(true);
      setReorderError(null);

      // Import the cart service dynamically
      const { addToCart } = await import('~/b2b/services/cartService');

      let addedCount = 0;
      const errors: string[] = [];

      for (const product of products) {
        try {
          await addToCart([{
            productEntityId: product.productId,
            variantEntityId: product.variantId,
            quantity: product.quantity,
          }]);
          addedCount++;
        } catch (err) {
          errors.push(`Failed to add ${product.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      if (addedCount > 0) {
        setReorderSuccess(true);
        setTimeout(() => setReorderSuccess(false), 5000);
      }

      if (errors.length > 0) {
        setReorderError(`Added ${addedCount}/${products.length} items. ${errors[0]}`);
      }
    } catch (error) {
      setReorderError(error instanceof Error ? error.message : 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      {reorderSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          Items added to cart successfully!
        </div>
      )}
      {reorderError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {reorderError}
        </div>
      )}

      <button
        onClick={handleReorder}
        disabled={reordering || products.length === 0}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {reordering ? 'Adding to Cart...' : `Reorder (${products.length} items)`}
      </button>

      <button
        onClick={handlePrint}
        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
      >
        Print Order
      </button>

      {hasShipment && (
        <button
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors cursor-not-allowed opacity-50"
          title="Tracking integration coming soon"
        >
          Track Shipment
        </button>
      )}
    </div>
  );
}
