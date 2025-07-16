import { NextRequest, NextResponse } from 'next/server';

import {
  addCartLineItem,
  assertAddCartLineItemErrors,
} from '~/client/mutations/add-cart-line-item';
import { assertCreateCartErrors, createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productEntityId = Number(formData.get('id'));
    const quantity = Number(formData.get('quantity')) || 1;

    console.log('API: Adding to cart', { productEntityId, quantity });

    if (!productEntityId || isNaN(productEntityId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Get cart ID from cookies
    const cartId = request.cookies.get('cartId')?.value;
    console.log('API: Cart ID from cookie', cartId);

    let cart;

    try {
      cart = await getCart(cartId);

      if (cart) {
        console.log('API: Adding to existing cart', cart.entityId);
        // Add to existing cart
        const addCartLineItemResponse = await addCartLineItem(cart.entityId, {
          lineItems: [
            {
              productEntityId,
              quantity,
            },
          ],
        });

        assertAddCartLineItemErrors(addCartLineItemResponse);

        cart = addCartLineItemResponse.data.cart.addCartLineItems?.cart;

        if (!cart?.entityId) {
          console.error('API: Failed to add to existing cart');
          return NextResponse.json(
            { error: 'Failed to add product to cart' },
            { status: 500 }
          );
        }

        console.log('API: Successfully added to existing cart', cart.entityId);
        return NextResponse.json({ success: true, cartId: cart.entityId });
      }

      console.log('API: Creating new cart');
      // Create new cart
      const createCartResponse = await createCart([
        {
          productEntityId,
          quantity,
        },
      ]);

      assertCreateCartErrors(createCartResponse);

      cart = createCartResponse.data.cart.createCart?.cart;

      if (!cart?.entityId) {
        console.error('API: Failed to create new cart');
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }

      console.log('API: Successfully created new cart', cart.entityId);
      // Set cart ID cookie
      const response = NextResponse.json({ success: true, cartId: cart.entityId });
      response.cookies.set({
        name: 'cartId',
        value: cart.entityId,
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('API: Error adding product to cart:', error);
      return NextResponse.json(
        { error: 'Failed to add product to cart' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Error processing add to cart request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 