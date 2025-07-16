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
      console.log('B2B Cart: Setting cart ID to', cartId);
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
      
      // Update the cookie to reflect the new cart ID
      document.cookie = `cartId=${newCartId}; path=/; secure; samesite=lax`;
      
      // Trigger a page refresh to update the cart state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    const handleProductAdded = (event: any) => {
      // Handle product added from B2B portal
      console.log('B2B Product Added:', event);
      
      // Trigger a page refresh to update the cart state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    const handleCartUpdated = (event: any) => {
      // Handle cart updates from B2B portal
      console.log('B2B Cart Updated:', event);
      
      // Trigger a page refresh to update the cart state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Listen for cart updates from the main application
    const handleMainCartUpdate = () => {
      console.log('B2B Cart: Main application cart updated');
      
      // Get the current cart ID from cookies
      const currentCartId = document.cookie
        .split('; ')
        .find(row => row.startsWith('cartId='))
        ?.split('=')[1];
      
      if (currentCartId && sdk.utils?.cart) {
        const b2bCartId = sdk.utils.cart.getEntityId();
        if (b2bCartId !== currentCartId) {
          console.log('B2B Cart: Syncing cart ID from main application', currentCartId);
          sdk.utils.cart.setEntityId(currentCartId);
        }
      }
    };

    // Add event listeners for B2B cart events
    sdk.callbacks?.addEventListener('on-cart-created', handleCartCreated);
    sdk.callbacks?.addEventListener('on-product-added', handleProductAdded);
    sdk.callbacks?.addEventListener('on-cart-updated', handleCartUpdated);

    // Add event listener for main application cart updates
    window.addEventListener('cart-updated', handleMainCartUpdate);

    return () => {
      // Remove event listeners on cleanup
      sdk.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
      sdk.callbacks?.removeEventListener('on-product-added', handleProductAdded);
      sdk.callbacks?.removeEventListener('on-cart-updated', handleCartUpdated);
      window.removeEventListener('cart-updated', handleMainCartUpdate);
    };
  }, [sdk]);

  return null;
} 