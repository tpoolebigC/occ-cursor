'use client';

import { useEffect, useState } from 'react';

import type { B2BSDK } from '../types/sdk';

/**
 * B2B SDK Hook
 * Provides access to the B2B SDK utilities and callbacks
 * Waits for the SDK to be fully loaded before returning
 */
export function useB2BSDK(): B2BSDK | null {
  const [sdk, setSdk] = useState<B2BSDK | null>(null);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    const interval = setInterval(() => {
      const getQuoteConfigs = window.b2b?.utils?.quote?.getQuoteConfigs;

      if (!getQuoteConfigs) {
        return;
      }

      if (window.b2b?.utils && getQuoteConfigs().length > 0) {
        setSdk(window.b2b);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return sdk;
} 