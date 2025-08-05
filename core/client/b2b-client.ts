/**
 * B2B-specific BigCommerce client configuration
 * 
 * This client handles B2B-specific operations without relying on
 * the B2B buyer portal or B3Storage dependencies.
 */

import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';
import { headers } from 'next/headers';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../userAgent';

// B2B-specific client configuration
export const b2bClient = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    try {
      // For B2B, we typically use a specific channel
      return process.env.BIGCOMMERCE_CHANNEL_ID || defaultChannelId;
    } catch {
      return defaultChannelId;
    }
  },
  beforeRequest: async (fetchOptions) => {
    const requestHeaders: Record<string, string> = {};

    // Add B2B-specific headers if needed
    if (process.env.B2B_API_TOKEN) {
      requestHeaders['X-B2B-Token'] = process.env.B2B_API_TOKEN;
    }

    // Add IP forwarding for cache busting
    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      const ipAddress = (await headers()).get('X-Forwarded-For');
      if (ipAddress) {
        requestHeaders['X-Forwarded-For'] = ipAddress;
        requestHeaders['True-Client-IP'] = ipAddress;
      }
    }

    return {
      headers: requestHeaders,
    };
  },
  onError: (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      console.warn('B2B BigCommerce auth error:', error);
      return;
    }
    
    // Log B2B-specific errors
    console.error('B2B client error:', error);
  },
});

/**
 * B2B REST API client for operations not available via GraphQL
 */
export class B2BRestClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com';
    this.token = process.env.B2B_API_TOKEN || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`B2B REST API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Company operations
  async getCompanies() {
    return this.request('/api/io/companies');
  }

  async getCompany(companyId: string) {
    return this.request(`/api/io/companies/${companyId}`);
  }

  // Quote operations
  async getQuotes(companyId?: string) {
    const endpoint = companyId 
      ? `/api/io/companies/${companyId}/quotes`
      : '/api/io/quotes';
    return this.request(endpoint);
  }

  async getQuote(quoteId: string) {
    return this.request(`/api/io/quotes/${quoteId}`);
  }

  async createQuote(data: any) {
    return this.request('/api/io/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Shopping list operations
  async getShoppingLists(companyId?: string) {
    const endpoint = companyId 
      ? `/api/io/companies/${companyId}/shopping-lists`
      : '/api/io/shopping-lists';
    return this.request(endpoint);
  }

  async getShoppingList(listId: string) {
    return this.request(`/api/io/shopping-lists/${listId}`);
  }

  async createShoppingList(data: any) {
    return this.request('/api/io/shopping-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Address operations
  async getAddresses(companyId?: string) {
    const endpoint = companyId 
      ? `/api/io/companies/${companyId}/addresses`
      : '/api/io/addresses';
    return this.request(endpoint);
  }

  async createAddress(data: any) {
    return this.request('/api/io/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const b2bRestClient = new B2BRestClient(); 