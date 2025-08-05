'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '~/b2b/services/cartService';

interface ReorderButtonProps {
  orderId: number;
  lineItems: Array<{
    node: {
      entityId: number;
      productEntityId: number;
      name: string;
      quantity: number;
      subTotalListPrice: {
        value: number;
        currencyCode: string;
      };
      // Make sku optional since it might not be available
      sku?: string;
    };
  }>;
}

export default function ReorderButton({ orderId, lineItems }: ReorderButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReorder = async () => {
    setIsProcessing(true);
    try {
      // Convert line items to cart items
      const cartItems = lineItems.map(item => ({
        productEntityId: item.node.productEntityId,
        quantity: item.node.quantity
      }));

      console.log('🛒 [Reorder] Adding items to cart:', cartItems);

      const result = await addToCart(cartItems);

      if (result.success) {
        console.log('✅ [Reorder] Successfully added items to cart');
        alert('Items added to cart successfully! You can now proceed to checkout.');
        
        // Optionally redirect to cart or checkout
        router.push('/checkout');
      } else {
        console.error('❌ [Reorder] Failed to add items to cart:', result.errors);
        alert(`Failed to add items to cart: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('❌ [Reorder] Error reordering:', error);
      alert('Error adding items to cart. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handleReorder}
      disabled={isProcessing}
      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
    >
      {isProcessing ? 'Adding to Cart...' : 'Reorder'}
    </button>
  );
} 