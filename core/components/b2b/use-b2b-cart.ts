'use client';

import { useEffect } from 'react';

import { useB2BSDK } from '~/shared/hooks/use-b2b-sdk';
import { handleB2BCartCreated } from '~/lib/cart/merge-carts';

export function useB2BCart(cartId?: string | null) {
  const sdk = useB2BSDK();

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }
    if (!sdk || !cartId) {
      return;
    }

    const currentCartId = sdk.utils?.cart?.getEntityId();

    if (currentCartId !== cartId) {
      sdk.utils?.cart?.setEntityId(cartId);
    }
  }, [sdk, cartId]);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    if (!sdk) {
      return;
    }

    const handleCartCreated = async ({ data: { cartId: newCartId } }: { data: { cartId: string } }) => {
      // Handle cart creation from B2B portal with merging
      console.log('B2B Cart Created:', newCartId);
      try {
        await handleB2BCartCreated(newCartId);
        console.log('Cart merge process completed');
      } catch (error) {
        console.error('Failed to handle B2B cart creation:', error);
      }
    };

    sdk.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk]);

  return null;
} 