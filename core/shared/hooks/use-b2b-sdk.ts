'use client';

import { useEffect, useState, useRef } from 'react';

// Global cache to prevent multiple instances
let globalSDK: typeof window.b2b | null = null;
let globalSDKPromise: Promise<typeof window.b2b> | null = null;

export function useB2BSDK() {
  const [sdk, setSdk] = useState<typeof window.b2b | null>(globalSDK);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    // If we already have the SDK, return immediately
    if (globalSDK) {
      setSdk(globalSDK);
      return;
    }

    // If we're already loading, wait for that promise
    if (globalSDKPromise) {
      globalSDKPromise.then((sdk) => {
        if (mountedRef.current) {
          setSdk(sdk);
        }
      });
      return;
    }

    // Create a new promise to load the SDK
    globalSDKPromise = new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max (50 * 100ms)
      
      const checkSDK = () => {
        attempts++;
        
        if (window.b2b?.utils?.quote?.getQuoteConfigs) {
          globalSDK = window.b2b;
          resolve(window.b2b);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn('B2B SDK failed to load within 5 seconds');
          resolve(null);
          return;
        }
        
        setTimeout(checkSDK, 100);
      };
      
      checkSDK();
    });

    globalSDKPromise.then((sdk) => {
      if (mountedRef.current) {
        setSdk(sdk);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return sdk;
}

// Reset function for testing/debugging
export function resetB2BSDK() {
  globalSDK = null;
  globalSDKPromise = null;
} 