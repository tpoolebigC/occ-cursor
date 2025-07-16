'use client';

import { useEffect, useRef } from 'react';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment?: 'staging' | 'production';
  cartId?: string | null;
}

export function B2BScript({ 
  storeHash, 
  channelId, 
  token, 
  environment = 'production',
  cartId
}: Props) {
  const scriptRef = useRef<HTMLScriptElement>(null);
  const configRef = useRef<HTMLScriptElement>(null);

  useB2BAuth(token);
  useB2BCart(cartId);

  useEffect(() => {
    // Only load scripts if they haven't been loaded yet
    if (scriptRef.current || configRef.current) {
      return;
    }

    console.log('B2B Script Debug:', {
      storeHash,
      channelId,
      environment,
      hasToken: !!token,
      cartId
    });

    // Create B3 configuration script (following official Catalyst B2B docs exactly)
    const configScript = document.createElement('script');
    configScript.id = 'b2b-config';
    configScript.innerHTML = `
      window.b3CheckoutConfig = {
        routes: {
          dashboard: '/#/dashboard',
        },
        // Checkout session syncing configuration
        checkout: {
          enableSessionSync: true,
          returnUrl: window.location.origin + '/cart',
          cartSyncEnabled: true
        }
      }
      window.B3 = {
        setting: {
          store_hash: '${storeHash}',
          channel_id: ${channelId},
          // Enable cart synchronization
          enable_cart_sync: true,
          cart_url: '/cart',
          checkout_url: '/checkout'
        }
      }
      console.log('B2B Config loaded:', window.B3);
    `;
    document.head.appendChild(configScript);
    configRef.current = configScript;

    // Create B2B script (following official pattern exactly)
    const b2bScript = document.createElement('script');
    b2bScript.setAttribute('data-channelid', channelId);
    b2bScript.setAttribute('data-environment', environment);
    b2bScript.setAttribute('data-storehash', storeHash);
    b2bScript.src = `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;
    b2bScript.type = 'module';
    b2bScript.crossOrigin = '';
    b2bScript.onload = () => {
      console.log('B2B Script loaded successfully');
      
      // Set up additional B2B configuration after script loads
      const b2b = (window as any).b2b;
      if (b2b && b2b.utils && b2b.utils.cart) {
        console.log('B2B SDK available, setting up cart integration');
        
        // Override cart methods to ensure proper integration
        const originalSetEntityId = b2b.utils.cart.setEntityId;
        b2b.utils.cart.setEntityId = (cartId: string) => {
          console.log('B2B Cart: Setting entity ID to', cartId);
          originalSetEntityId.call(b2b.utils.cart, cartId);
          
          // Update cookie to sync with main cart
          document.cookie = `cartId=${cartId}; path=/; secure; samesite=lax`;
        };
      }
    };
    b2bScript.onerror = (e) => console.error('B2B Script failed to load:', e);
    document.head.appendChild(b2bScript);
    scriptRef.current = b2bScript;

    return () => {
      // Cleanup on unmount
      if (configRef.current) {
        document.head.removeChild(configRef.current);
        configRef.current = null;
      }
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [storeHash, channelId, environment, token, cartId]);

  // Return null to avoid React rendering conflicts
  return null;
} 