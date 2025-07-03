'use client';

import { useEffect } from 'react';

import { useSDK } from './use-b2b-sdk';

export function useB2BCart(cartId?: string | null) {
  const sdk = useSDK();

  useEffect(() => {
    if (!sdk || !cartId) {
      return;
    }

    const currentCartId = sdk.utils?.cart?.getEntityId();

    if (currentCartId !== cartId) {
      sdk.utils?.cart?.setEntityId(cartId);
    }
  }, [sdk, cartId]);

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const handleCartCreated = ({ data: { cartId: newCartId } }: { data: { cartId: string } }) => {
      // Handle cart creation from B2B portal
      console.log('B2B Cart Created:', newCartId);
    };

    sdk.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk]);

  return null;
} 