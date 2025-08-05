'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      console.log('B2B Script: Skipping on server side');
      return;
    }

    // Only load scripts if they haven't been loaded yet
    if (scriptRef.current || configRef.current) {
      console.log('B2B Script: Scripts already loaded, skipping');
      return;
    }

    console.log('B2B Script Debug:', {
      storeHash,
      channelId,
      environment,
      hasToken: !!token,
      cartId,
      hasStoreHash: !!storeHash,
      hasChannelId: !!channelId
    });

    // Validate required parameters
    if (!storeHash) {
      console.error('B2B Script: Missing storeHash');
      return;
    }

    if (!channelId) {
      console.error('B2B Script: Missing channelId');
      return;
    }

    console.log('B2B Script: Creating config script...');

    // Create config script with enhanced configuration
    const configScript = document.createElement('script');
    configScript.id = 'b2b-config';
    configScript.innerHTML = `
      window.B3 = {
        setting: {
          store_hash: '${storeHash}',
          channel_id: ${channelId},
          platform: 'catalyst',
          cart_url: '/cart',
          enable_cart_creation: true,
          enable_cart_sync: true,
          debug_mode: true
        }
      }
      console.log('B2B Config loaded:', window.B3);
      
      // Add global B2B debugging
      window.b2bDebug = {
        getCartId: () => window.b2b?.utils?.cart?.getEntityId?.(),
        getB2BToken: () => window.b2b?.utils?.user?.getB2BToken?.(),
        getProfile: () => window.b2b?.utils?.user?.getProfile?.(),
        triggerCartCreated: () => {
          if (window.b2b?.callbacks?.dispatchEvent) {
            window.b2b.callbacks.dispatchEvent('on-cart-created');
            console.log('Manually triggered cart-created event');
          }
        }
      };
    `;
    document.head.appendChild(configScript);
    configRef.current = configScript;
    console.log('B2B Script: Config script added to head');

    // Create B2B script
    console.log('B2B Script: Creating B2B script...');
    const b2bScript = document.createElement('script');
    b2bScript.setAttribute('data-channelid', channelId);
    b2bScript.setAttribute('data-environment', environment);
    b2bScript.setAttribute('data-storehash', storeHash);
    b2bScript.src = `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;
    b2bScript.type = 'module';
    
    b2bScript.onload = () => {
      console.log('B2B Script loaded successfully');
      
      // Wait a bit for the SDK to initialize, then check cart creation
      setTimeout(() => {
        const b2b = (window as any).b2b;
        if (b2b?.utils?.cart) {
          console.log('B2B Cart utils available after load');
          const currentCartId = b2b.utils.cart.getEntityId();
          console.log('Initial B2B cart ID:', currentCartId);
          
          // If no cart ID, try to create one
          if (!currentCartId) {
            console.log('No cart ID found, attempting to initialize cart...');
            // The B2B portal should create a cart when needed
          }
        } else {
          console.log('B2B Cart utils not available after load');
        }
      }, 1000);
    };
    
    b2bScript.onerror = (e) => {
      console.error('B2B Script failed to load:', e);
      console.error('B2B Script URL:', b2bScript.src);
    };
    
    document.head.appendChild(b2bScript);
    scriptRef.current = b2bScript;
    console.log('B2B Script: B2B script added to head, URL:', b2bScript.src);

    return () => {
      // Cleanup on unmount
      console.log('B2B Script: Cleaning up...');
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