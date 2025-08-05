/**
 * B2B Cart Service using gql-tada
 * 
 * This service handles cart operations using Catalyst's patterns and gql-tada
 * for type-safe GraphQL operations.
 */

import { addToOrCreateCart } from '~/lib/cart';

export interface CartItem {
  productEntityId: number;
  quantity: number;
  selectedOptions?: Array<{
    entityId: number;
    name: string;
  }>;
}

export interface Cart {
  entityId: string;
  currencyCode: string;
  isTaxIncluded: boolean;
  lineItems: {
    physicalItems: Array<{
      entityId: string;
      productEntityId: number;
      name: string;
      quantity: number;
      selectedOptions: Array<{
        entityId: number;
        name: string;
      }>;
      imageUrl?: string | null;
      prices: unknown;
    }>;
    digitalItems: Array<{
      entityId: string;
      productEntityId: number;
      name: string;
      quantity: number;
      selectedOptions: Array<{
        entityId: number;
        name: string;
      }>;
      imageUrl?: string | null;
      prices: unknown;
    }>;
  };
  cartAmount: unknown;
}

/**
 * Add items to cart using Catalyst's addToOrCreateCart utility
 */
export async function addToCart(items: CartItem[]): Promise<{ success: boolean; errors?: string[] }> {
  try {
    console.log('🛒 [Cart Service] Adding items to cart:', items);

    // Convert items to the format expected by Catalyst's addToOrCreateCart
    const lineItems = items.map(item => ({
      productEntityId: item.productEntityId,
      quantity: item.quantity,
      // selectedOptions will be handled separately when we implement proper option handling
    }));

    // Use Catalyst's existing cart utility
    await addToOrCreateCart({ lineItems });

    console.log('🛒 [Cart Service] Successfully added items to cart');
    return { success: true };
  } catch (error) {
    console.error('🛒 [Cart Service] Error adding items to cart:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

/**
 * Get current cart - this will be handled by server actions
 */
export async function getCart(): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    console.log('🛒 [Cart Service] Getting cart...');
    
    // This will be handled by server actions instead
    return { success: false, errors: ['Cart retrieval should be handled by server actions'] };
  } catch (error) {
    console.error('🛒 [Cart Service] Error getting cart:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

/**
 * Reorder from an existing order
 */
export async function reorderFromOrder(orderId: number): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    console.log('🛒 [Cart Service] Reordering from order:', orderId);
    
    // This will be handled by server actions
    return { success: false, errors: ['Reorder should be handled by server actions'] };
  } catch (error) {
    console.error('🛒 [Cart Service] Error reordering from order:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

/**
 * Clear the current cart
 */
export async function clearCart(): Promise<{ success: boolean; errors?: string[] }> {
  try {
    console.log('🛒 [Cart Service] Clearing cart...');
    
    // This will be handled by server actions
    return { success: false, errors: ['Clear cart should be handled by server actions'] };
  } catch (error) {
    console.error('🛒 [Cart Service] Error clearing cart:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
} 