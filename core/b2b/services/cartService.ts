'use server';

import { auth } from '~/auth';
import { addToOrCreateCart } from '~/lib/cart';
import { getCart as getCartData } from '~/client/queries/get-cart';

export interface CartItem {
  productEntityId: number;
  quantity: number;
  selectedOptions?: Array<{
    entityId: number;
    name: string;
    value: string;
  }>;
}

export interface CartLineItem {
  entityId: number;
  productEntityId: number;
  name: string;
  sku: string;
  quantity: number;
  imageUrl?: string;
  price: number;
  salePrice?: number;
}

export interface Cart {
  entityId: string;
  lineItems: CartLineItem[];
}

export async function addToCart(items: CartItem[]): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { success: false, errors: ['No customer access token available'] };
    }

    console.log('🛒 [Cart Service] Adding items to cart:', items);

    // Convert items to the format expected by Catalyst's addToOrCreateCart
    // This should be a CreateCartInput or AddCartLineItemsInput['data']
    const cartData = {
      lineItems: items.map(item => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || []
      }))
    };

    // Use Catalyst's existing cart utility
    await addToOrCreateCart(cartData);

    console.log('🛒 [Cart Service] Successfully added items to cart');

    // Get the updated cart using Catalyst's getCart utility
    const cartResult = await getCart();
    return { success: true, cart: cartResult.cart };
  } catch (error) {
    console.error('🛒 [Cart Service] Error adding to cart:', error);
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

export async function getCart(): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { success: false, errors: ['No customer access token available'] };
    }

    // Use Catalyst's existing getCart utility
    const cartData = await getCartData();
    
    if (!cartData) {
      return { success: false, errors: ['No cart found'] };
    }

    // Transform cart data to our interface
    const cart: Cart = {
      entityId: cartData.entityId,
      lineItems: [
        ...(cartData.lineItems.physicalItems || []).map((item: any) => ({
          entityId: item.entityId,
          productEntityId: item.productEntityId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          price: item.extendedListPrice.value,
          salePrice: item.extendedSalePrice?.value
        })),
        ...(cartData.lineItems.digitalItems || []).map((item: any) => ({
          entityId: item.entityId,
          productEntityId: item.productEntityId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          price: item.extendedListPrice.value,
          salePrice: item.extendedSalePrice?.value
        }))
      ]
    };

    return { success: true, cart };
  } catch (error) {
    console.error('🛒 [Cart Service] Error getting cart:', error);
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

export async function reorderFromOrder(orderId: number): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    // Get order details first
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { success: false, errors: ['No customer access token available'] };
    }

    // For now, we'll use a simplified approach
    // In a real implementation, you'd fetch the order details and extract line items
    console.log('🛒 [Cart Service] Reordering from order:', orderId);
    
    // This would need to be implemented based on your order structure
    // For now, return an error
    return { success: false, errors: ['Reorder functionality not yet implemented'] };
  } catch (error) {
    console.error('🛒 [Cart Service] Error reordering:', error);
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
} 