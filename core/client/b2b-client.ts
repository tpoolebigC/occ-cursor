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

class B2BApiError extends Error {
  status: number;
  url: string;
  responseText?: string;

  constructor(message: string, status: number, url: string, responseText?: string) {
    super(message);
    this.status = status;
    this.url = url;
    this.responseText = responseText;
  }
}

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
  private b2bApiToken: string;

  constructor(customerToken?: string) {
    this.baseUrl = process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com';
    // Use B2B API token from environment, not customer token
    this.b2bApiToken = process.env.B2B_API_TOKEN || '';
    
    if (!this.b2bApiToken) {
      throw new Error('B2B_API_TOKEN environment variable is required for B2B API calls');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, attempt: number = 0): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const maxRetries = 3;
    const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);

    const response = await fetch(url, {
      ...options,
      headers: {
        authToken: this.b2bApiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => undefined);

      if (retryableStatusCodes.has(response.status) && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * 2 ** attempt + Math.floor(Math.random() * 250), 5000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return this.request<T>(endpoint, options, attempt + 1);
      }

      throw new B2BApiError(
        `B2B REST API error: ${response.status} ${response.statusText}`,
        response.status,
        url,
        responseText,
      );
    }

    // In some cases the API can return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
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
  async getShoppingLists(customerId?: string) {
    const params = new URLSearchParams();
    if (customerId) {
      params.append('customerId', customerId);
    }
    const endpoint = `/api/v3/io/shopping-list?${params.toString()}`;
    return this.request(endpoint);
  }

  async getShoppingList(listId: string, customerId?: string) {
    const params = new URLSearchParams();
    if (customerId) {
      params.append('customerId', customerId);
    }
    const endpoint = `/api/v3/io/shopping-list/${listId}?${params.toString()}`;
    return this.request(endpoint);
  }

  async createShoppingList(data: any) {
    return this.request('/api/v3/io/shopping-list', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShoppingList(listId: string, data: any) {
    return this.request(`/api/v3/io/shopping-list/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShoppingList(listId: string) {
    return this.request(`/api/v3/io/shopping-list/${listId}`, {
      method: 'DELETE',
    });
  }

  async addItemToShoppingList(listId: string, data: any) {
    // For adding items, we use the update endpoint with items array
    return this.request(`/api/v3/io/shopping-list/${listId}`, {
      method: 'PUT',
      body: JSON.stringify({ items: [data] }),
    });
  }

  async updateShoppingListItem(listId: string, itemId: string, data: any) {
    // For updating items, we use the update endpoint with items array
    return this.request(`/api/v3/io/shopping-list/${listId}`, {
      method: 'PUT',
      body: JSON.stringify({ items: [{ id: itemId, ...data }] }),
    });
  }

  async removeItemFromShoppingList(listId: string, itemId: string) {
    return this.request(`/api/v3/io/shopping-list/${listId}/items/${itemId}`, {
      method: 'DELETE',
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

  async deleteAddress(addressId: string) {
    return this.request(`/api/io/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export const b2bRestClient = new B2BRestClient(); 