'use server';

import { unstable_expireTag } from 'next/cache';

import { auth } from '~/auth';
import { anonymousSignIn, getAnonymousSession } from '~/auth/server';
import { bcManagementClient } from '~/client/bc-management-client';
import { TAGS } from '~/client/tags';
import { getCartId, setCartId } from '~/lib/cart';

/**
 * Safely store a Management API cart ID in the session.
 * Creates an anonymous session first if no session exists at all,
 * avoiding the NextAuth unstable_update corruption when no session is active.
 */
async function safeSetCartId(cartId: string) {
  const anonymousSession = await getAnonymousSession();

  if (anonymousSession) {
    // Anonymous session exists -- use normal flow
    await setCartId(cartId);
    return;
  }

  const session = await auth();

  if (session) {
    // Logged-in session exists -- use normal flow
    await setCartId(cartId);
    return;
  }

  // No session at all -- create anonymous session with the cart ID
  await anonymousSignIn({ cartId });
}

/**
 * Add a flooring product to cart using the Management API.
 *
 * Sqft mode: Uses list_price override to set exact calculated price (qty=1).
 *            Stores the sqft value as a product modifier for order lifecycle visibility.
 * Box mode:  Uses standard quantity at box price (integer quantity, no price override).
 */
export async function addFlooringToCart(input: {
  mode: 'sqft' | 'boxes';
  productId: number;
  variantId: number;
  // Sqft mode
  sqft?: number;
  pricePerSqft?: number;
  modifierOptionId?: number;
  // Box mode
  boxes?: number;
  // Shared
  channelId?: number;
  customerId?: number;
}) {
  try {
    const cartId = await getCartId();

    // Resolve variant ID if not provided
    let variantId = input.variantId;
    if (!variantId) {
      const variantsResp = await bcManagementClient.getProductVariants(input.productId);
      const firstVariant = variantsResp?.data?.[0];
      if (!firstVariant) {
        return { success: false, error: 'Could not resolve product variant' };
      }
      variantId = firstVariant.id;
    }

    if (input.mode === 'sqft') {
      if (!input.sqft || !input.pricePerSqft) {
        return { success: false, error: 'Square footage and price per sqft are required' };
      }

      const totalPrice = Math.round(input.sqft * input.pricePerSqft * 100) / 100;

      const lineItem: {
        product_id: number;
        variant_id: number;
        quantity: number;
        list_price: number;
        option_selections?: Array<{ option_id: number; option_value: string }>;
      } = {
        product_id: input.productId,
        variant_id: variantId,
        quantity: 1,
        list_price: totalPrice,
      };

      // Store sqft as modifier value if modifier exists
      if (input.modifierOptionId) {
        lineItem.option_selections = [
          {
            option_id: input.modifierOptionId,
            option_value: input.sqft.toString(),
          },
        ];
      }

      if (cartId) {
        await bcManagementClient.addCartLineItem(cartId, lineItem);
      } else {
        const response = await bcManagementClient.createCart(
          [lineItem],
          input.channelId,
          input.customerId,
        );
        const newCartId = response?.data?.id;
        if (newCartId) {
          await safeSetCartId(newCartId);
        } else {
          return { success: false, error: 'Failed to create cart' };
        }
      }
    } else {
      // Box mode: standard quantity at box price
      if (!input.boxes || input.boxes < 1) {
        return { success: false, error: 'Number of boxes is required' };
      }

      const lineItem = {
        product_id: input.productId,
        variant_id: variantId,
        quantity: input.boxes,
      };

      if (cartId) {
        await bcManagementClient.addCartLineItem(cartId, lineItem);
      } else {
        const response = await bcManagementClient.createCart(
          [lineItem],
          input.channelId,
          input.customerId,
        );
        const newCartId = response?.data?.id;
        if (newCartId) {
          await safeSetCartId(newCartId);
        } else {
          return { success: false, error: 'Failed to create cart' };
        }
      }
    }

    unstable_expireTag(TAGS.cart);

    return { success: true, error: null };
  } catch (error) {
    console.error('[addFlooringToCart] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to cart',
    };
  }
}
