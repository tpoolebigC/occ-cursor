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

    // Create config script
    const configScript = document.createElement('script');
    configScript.id = 'b2b-config';
    configScript.innerHTML = `
      window.B3 = {
        setting: {
          store_hash: '${storeHash}',
          channel_id: ${channelId},
          platform: 'catalyst',
          cart_url: '/cart',
        }
      }
      console.log('B2B Config loaded:', window.B3);
    `;
    document.head.appendChild(configScript);
    configRef.current = configScript;

    // Create B2B script
    const b2bScript = document.createElement('script');
    b2bScript.setAttribute('data-channelid', channelId);
    b2bScript.setAttribute('data-environment', environment);
    b2bScript.setAttribute('data-storehash', storeHash);
    b2bScript.src = `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;
    b2bScript.type = 'module';
    b2bScript.onload = () => console.log('B2B Script loaded successfully');
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