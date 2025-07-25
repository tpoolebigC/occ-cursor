'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { setCartId } from '~/lib/cart';
import { useB2BSDK } from './use-b2b-sdk';

/**
 * B2B Cart Hook
 * Handles B2B cart synchronization and cart creation events
 */
export function useB2BCart(id?: string | null) {
  const router = useRouter();
  const sdk = useB2BSDK();

  const handleCartCreated = useCallback(
    ({ data: { cartId = '' } }: { data: { cartId: string } }) => {
      void setCartId(cartId)
        .then(() => {
          router.refresh();
        })
        .catch((error: unknown) => {
          console.error('Failed to set cart ID:', error);
        });
    },
    [router],
  );

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    sdk?.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk?.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk, handleCartCreated]);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    if (sdk && id && id !== sdk.utils?.cart?.getEntityId()) {
      sdk.utils?.cart?.setEntityId(id);
    }
  }, [sdk, id]);

  return null;
} 