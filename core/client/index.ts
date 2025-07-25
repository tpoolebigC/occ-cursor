/**
 * Client-safe BigCommerce client configuration
 * 
 * This file contains a client-safe version of the BigCommerce client.
 * For server-side functionality, import from './server-client' instead.
 */

import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../userAgent';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// For client-side, we need to ensure we have valid configuration
const getClientConfig = () => {
  const storefrontToken = process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '';
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? '1';
  
  // Validate required fields
  if (!storefrontToken || !storeHash || !channelId) {
    console.warn('Missing BigCommerce configuration for client-side usage');
  }
  
  return {
    storefrontToken,
    storeHash,
    channelId,
  };
};

const config = getClientConfig();

export const client = createClient({
  storefrontToken: config.storefrontToken,
  storeHash: config.storeHash,
  channelId: config.channelId,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    // Client-safe version - use provided channelId or default
    return config.channelId || defaultChannelId;
  },
  beforeRequest: async (fetchOptions) => {
    // Client-safe version - minimal headers
    const requestHeaders: Record<string, string> = {};

    return {
      headers: requestHeaders,
    };
  },
  onError: (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      // Client-safe error handling - log instead of redirect
      console.error('BigCommerce auth error:', error);
    }
  },
});
