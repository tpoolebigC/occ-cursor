'use client';

import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { setCartId } from '~/lib/cart';
import { useSDK } from './use-b2b-sdk';

export function useB2BCart(cartId?: string | null) {
  const router = useRouter();
  const sdk = useSDK();

  const handleCartCreated = useCallback(
    ({ data: { cartId: newCartId = '' } }: { data: { cartId: string } }) => {
      console.log('B2B Cart Created:', newCartId);
      
      void setCartId(newCartId)
        .then(() => {
          console.log('Cart ID updated, refreshing page');
          router.refresh();
        })
        .catch((error: unknown) => {
          console.error('Failed to update cart ID:', error);
        });
    },
    [router],
  );

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk?.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk, handleCartCreated]);

  useEffect(() => {
    if (sdk && cartId && cartId !== sdk.utils?.cart?.getEntityId()) {
      console.log('B2B Cart Sync: Setting cart ID from Catalyst to B2B portal:', cartId);
      sdk.utils?.cart?.setEntityId(cartId);
    }
  }, [sdk, cartId]);

  return null;
} 