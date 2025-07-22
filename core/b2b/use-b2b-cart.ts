'use client';

import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { setCartId, getCartId } from '~/lib/cart';
import { handleB2BCartCreated } from '~/lib/cart/merge-carts';
import { useSDK } from './use-b2b-sdk';

export function useB2BCart(cartId?: string | null) {
  const router = useRouter();
  const sdk = useSDK();

  const handleCartCreated = useCallback(
    async ({ data: { cartId: newCartId = '' } }: { data: { cartId: string } }) => {
      console.log('🎯 B2B Cart Created Event Received:', {
        newCartId,
        currentCartId: cartId,
        hasSDK: !!sdk,
        sdkCartId: sdk?.utils?.cart?.getEntityId()
      });
      
      try {
        // Use the new cart merging functionality
        await handleB2BCartCreated(newCartId);
        console.log('✅ Cart merge process completed, refreshing page');
        router.refresh();
      } catch (error: unknown) {
        console.error('❌ Failed to handle B2B cart creation:', error);
        
        // Fallback: just update the cart ID if merging fails
        console.log('🔄 Fallback: Updating cart ID without merging');
        try {
          await setCartId(newCartId);
          router.refresh();
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
    },
    [router, cartId, sdk],
  );

  useEffect(() => {
    console.log('🔧 Setting up B2B cart event listeners:', {
      hasSDK: !!sdk,
      hasCallbacks: !!sdk?.callbacks,
      currentCartId: cartId
    });

    sdk?.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      console.log('🧹 Cleaning up B2B cart event listeners');
      sdk?.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk, handleCartCreated]);

  useEffect(() => {
    if (sdk && cartId && cartId !== sdk.utils?.cart?.getEntityId()) {
      console.log('🔄 B2B Cart Sync: Setting cart ID from Catalyst to B2B portal:', {
        catalystCartId: cartId,
        b2bCartId: sdk.utils?.cart?.getEntityId()
      });
      sdk.utils?.cart?.setEntityId(cartId);
    }
  }, [sdk, cartId]);

  return null;
} 