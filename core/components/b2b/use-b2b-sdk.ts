'use client';

import { useEffect, useState } from 'react';

export function useSDK() {
  const [sdk, setSdk] = useState<typeof window.b2b | undefined>();

  useEffect(() => {
    const checkSDK = () => {
      if (typeof window !== 'undefined' && window.b2b) {
        console.log('B2B SDK Debug:', {
          sdk: window.b2b,
          utils: window.b2b.utils,
          callbacks: window.b2b.callbacks,
          openPage: window.b2b.utils?.openPage,
          user: window.b2b.utils?.user,
          quote: window.b2b.utils?.quote,
          cart: window.b2b.utils?.cart
        });
        setSdk(window.b2b);
      }
    };

    // Check immediately
    checkSDK();

    // Set up a polling mechanism to wait for the SDK to load
    const interval = setInterval(checkSDK, 100);

    // Clear interval after 10 seconds to avoid infinite polling
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return sdk;
} 