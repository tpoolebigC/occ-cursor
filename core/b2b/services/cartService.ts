/**
 * B2B Cart Service
 *
 * Handles cart operations using Catalyst's addToOrCreateCart utility.
 * Supports variant/option selection for products with required options.
 */

import { addToOrCreateCart } from '~/lib/cart';

export interface CartItemSelectedOption {
  optionEntityId: number;
  valueEntityId?: number;
  // For text/number/date fields:
  text?: string;
  number?: number;
  date?: { utc: string };
}

export interface CartItem {
  productEntityId: number;
  quantity: number;
  variantEntityId?: number;
  selectedOptions?: {
    multipleChoices?: Array<{ optionEntityId: number; optionValueEntityId: number }>;
    checkboxes?: Array<{ optionEntityId: number; optionValueEntityId: number }>;
    numberFields?: Array<{ optionEntityId: number; number: number }>;
    textFields?: Array<{ optionEntityId: number; text: string }>;
    multiLineTextFields?: Array<{ optionEntityId: number; text: string }>;
    dateFields?: Array<{ optionEntityId: number; date: { utc: string } }>;
  };
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
  amount: unknown;
}

/**
 * Add items to cart using Catalyst's addToOrCreateCart utility.
 * Now properly passes through selectedOptions and variantEntityId for variant products.
 */
export async function addToCart(items: CartItem[]): Promise<{ success: boolean; errors?: string[] }> {
  try {
    // Convert items to the format expected by Catalyst's addToOrCreateCart
    const lineItems = items.map((item) => {
      const lineItem: Record<string, unknown> = {
        productEntityId: item.productEntityId,
        quantity: item.quantity,
      };

      // Pass variant ID if provided (e.g. from SKU lookup)
      if (item.variantEntityId) {
        lineItem.variantEntityId = item.variantEntityId;
      }

      // Pass selected options if provided (for products with required options)
      if (item.selectedOptions) {
        lineItem.selectedOptions = item.selectedOptions;
      }

      return lineItem;
    });

    // Use Catalyst's existing cart utility
    await addToOrCreateCart({ lineItems } as any);

    return { success: true };
  } catch (error) {
    console.error('[Cart Service] Error adding items to cart:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Reorder from an existing order -- carries variant selections from original line items
 */
export async function reorderFromOrder(
  lineItems: Array<{
    productEntityId: number;
    quantity: number;
    variantEntityId?: number;
    selectedOptions?: CartItem['selectedOptions'];
  }>,
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const cartItems: CartItem[] = lineItems.map((item) => ({
      productEntityId: item.productEntityId,
      quantity: item.quantity,
      variantEntityId: item.variantEntityId,
      selectedOptions: item.selectedOptions,
    }));

    return addToCart(cartItems);
  } catch (error) {
    console.error('[Cart Service] Error reordering:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
