/**
 * B2B REST Management API Client
 *
 * @deprecated This client is being replaced by the B2B GraphQL API client
 * at `~/b2b/graphql`. The GraphQL API provides the same data in fewer calls
 * with automatic company scoping via the b2bToken.
 *
 * Migration path:
 * - Orders:        import { getAllOrders, getOrderDetail } from '~/b2b/graphql'
 * - Quotes:        import { getQuotes, createQuote } from '~/b2b/graphql'
 * - Invoices:      import { getInvoices, getInvoicePdf } from '~/b2b/graphql'
 * - Shopping Lists: import { getShoppingLists } from '~/b2b/graphql'
 * - Addresses:     import { getCompanyAddresses } from '~/b2b/graphql'
 * - Users:         import { getUsers, createUser } from '~/b2b/graphql'
 * - Company:       import { getCompanyInfo } from '~/b2b/graphql'
 * - Masquerade:    import { beginSuperAdminMasquerade } from '~/b2b/graphql'
 *
 * This file is kept temporarily for edge cases during migration.
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

    // Add B2B-specific headers if needed (new auth format)
    if (process.env.B2B_X_AUTH_TOKEN) {
      requestHeaders['X-B2B-Token'] = process.env.B2B_X_AUTH_TOKEN;
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
 * 
 * Authentication updated per B2B Edition docs (Sept 2025):
 * Server-to-server requests now use X-Auth-Token + X-Store-Hash
 * instead of the deprecated authToken header.
 * See: https://developer.bigcommerce.com/b2b-edition/docs/authentication
 */
export class B2BRestClient {
  private baseUrl: string;
  private xAuthToken: string;
  private storeHash: string;

  constructor() {
    this.baseUrl = process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com';
    
    // New auth: V3 API token with B2B Edition scope (replaces deprecated authToken)
    this.xAuthToken = process.env.B2B_X_AUTH_TOKEN || '';
    this.storeHash = process.env.BIGCOMMERCE_STORE_HASH || '';
    
    if (!this.xAuthToken) {
      throw new Error(
        'B2B_X_AUTH_TOKEN environment variable is required. ' +
        'Create a V3 API token with B2B Edition scope set to "modify" in the BigCommerce control panel.'
      );
    }

    if (!this.storeHash) {
      throw new Error('BIGCOMMERCE_STORE_HASH environment variable is required for B2B API calls');
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}, attempt: number = 0): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const maxRetries = 3;
    const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Auth-Token': this.xAuthToken,
        'X-Store-Hash': this.storeHash,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => undefined);

      // Always log the full error details for debugging
      console.error(
        `[B2B REST API] ${response.status} ${response.statusText} - ${options.method ?? 'GET'} ${endpoint}`,
        responseText ? `\nResponse body: ${responseText}` : '',
      );

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

  /**
   * Resolve a BigCommerce customer ID (or email) to a B2B Edition company.
   *
   * Strategy:
   * 1. First try matching by bcCustomerId (fast path)
   * 2. If no match, try matching by email (bcCustomerId is often empty)
   * 3. Paginates through /api/v3/io/users until found
   */
  async getCompanyIdByCustomerId(bcCustomerId: number, email?: string): Promise<number | null> {
    let offset = 0;
    const limit = 50;
    const maxPages = 10;

    for (let page = 0; page < maxPages; page++) {
      const response = await this.request<B2BUsersResponse>(
        `/api/v3/io/users?limit=${limit}&offset=${offset}`,
      );

      const users = response?.data ?? [];

      // Try bcCustomerId match first
      const matchById = users.find(
        (u) => u.bcCustomerId === bcCustomerId || (u as any).customerId === bcCustomerId,
      );
      if (matchById) {
        return matchById.companyId as unknown as number ?? (matchById as any).companyId;
      }

      // Fall back to email match (bcCustomerId is often empty in B2B Edition)
      if (email) {
        const matchByEmail = users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase(),
        );
        if (matchByEmail) {
          return matchByEmail.companyId as unknown as number ?? (matchByEmail as any).companyId;
        }
      }

      const total = response?.meta?.pagination?.totalCount ?? 0;
      offset += limit;
      if (offset >= total || users.length === 0) {
        break;
      }
    }

    return null;
  }

  // Quote / RFQ operations (B2B REST Management API)
  // The correct endpoint is /api/v3/io/rfq (NOT /api/v3/io/quotes)
  async getQuotes(companyId?: string) {
    const searchParams = new URLSearchParams();
    if (companyId) searchParams.append('companyId', companyId);
    const qs = searchParams.toString();
    return this.request(`/api/v3/io/rfq${qs ? `?${qs}` : ''}`);
  }

  async getQuote(quoteId: string) {
    return this.request(`/api/v3/io/rfq/${quoteId}`);
  }

  async createQuote(data: any) {
    return this.request('/api/v3/io/rfq', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generate cart + checkout URLs for a quote
  // Only works for quotes in status: New (0), In Process (2), Updated by Customer (3)
  async checkoutQuote(quoteId: number) {
    return this.request(`/api/v3/io/rfq/${quoteId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Add item(s) to a quote
  async addToQuote(quoteId: number, data: any) {
    return this.request(`/api/v3/io/rfq/${quoteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Add item to a shopping list
  async addShoppingListItem(listId: string, data: any) {
    return this.request(`/api/v3/io/shopping-list/${listId}/item`, {
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

  // =========================================================================
  // Order operations (B2B REST Management API)
  // =========================================================================
  async getOrders(params: {
    companyId?: string;
    offset?: number;
    limit?: number;
    orderBy?: string;
    sortBy?: 'DESC' | 'ASC';
    q?: string;
    status?: string;
    beginDateAt?: string;
    endDateAt?: string;
    channelId?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    if (params.companyId) searchParams.append('companyId', params.companyId);
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.orderBy) searchParams.append('orderBy', params.orderBy);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.q) searchParams.append('q', params.q);
    if (params.status) searchParams.append('status', params.status);
    if (params.beginDateAt) searchParams.append('beginDateAt', params.beginDateAt);
    if (params.endDateAt) searchParams.append('endDateAt', params.endDateAt);
    if (params.channelId) searchParams.append('channelId', params.channelId.toString());
    
    const qs = searchParams.toString();
    return this.request<B2BOrdersResponse>(`/api/v3/io/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrder(orderId: number) {
    return this.request<B2BOrderDetailResponse>(`/api/v3/io/orders/${orderId}`);
  }

  async updateOrder(bcOrderId: number, data: Record<string, unknown>) {
    return this.request(`/api/v3/io/orders/${bcOrderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =========================================================================
  // Invoice operations (B2B REST Management API)
  // IMPORTANT: Invoice endpoints use /api/v3/io/ip/invoices (note the /ip/ segment)
  // =========================================================================
  async getInvoices(params: {
    companyId?: string;
    offset?: number;
    limit?: number;
    orderBy?: string;
    sortBy?: 'DESC' | 'ASC';
    q?: string;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    if (params.companyId) searchParams.append('customerId', params.companyId);
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.orderBy) searchParams.append('orderBy', params.orderBy);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.q) searchParams.append('q', params.q);
    if (params.status) searchParams.append('status', params.status);
    
    const qs = searchParams.toString();
    return this.request<B2BInvoicesResponse>(`/api/v3/io/ip/invoices${qs ? `?${qs}` : ''}`);
  }

  async getInvoice(invoiceId: string) {
    return this.request<B2BInvoiceDetailResponse>(`/api/v3/io/ip/invoices/${invoiceId}`);
  }

  async getInvoicePdf(invoiceId: string) {
    return this.request<{ data: { url: string } }>(`/api/v3/io/ip/invoices/${invoiceId}/download-pdf`);
  }

  // Create invoice from a B2B order
  async createInvoiceFromOrder(b2bOrderId: number) {
    return this.request(`/api/v3/io/ip/orders/${b2bOrderId}/invoices`, {
      method: 'POST',
    });
  }

  // =========================================================================
  // User / Company User operations
  // =========================================================================
  async getCompanyUsers(companyId: string, params: {
    offset?: number;
    limit?: number;
    q?: string;
    role?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append('companyId', companyId);
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.q) searchParams.append('q', params.q);
    if (params.role) searchParams.append('role', params.role);
    
    const qs = searchParams.toString();
    return this.request<B2BUsersResponse>(`/api/v3/io/users?${qs}`);
  }

  async getCompanyUser(companyId: string, userId: string) {
    return this.request(`/api/v3/io/companies/${companyId}/users/${userId}`);
  }

  async createCompanyUser(companyId: string, data: Record<string, unknown>) {
    return this.request(`/api/v3/io/companies/${companyId}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompanyUser(companyId: string, userId: string, data: Record<string, unknown>) {
    return this.request(`/api/v3/io/companies/${companyId}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompanyUser(companyId: string, userId: string) {
    return this.request(`/api/v3/io/companies/${companyId}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // =========================================================================
  // Company catalog / price list operations
  // =========================================================================
  async getCompanyCatalog(companyId: string) {
    return this.request(`/api/v3/io/companies/${companyId}/catalog`);
  }

  async getCompanyPriceLists(companyId: string) {
    return this.request(`/api/v3/io/companies/${companyId}/price-lists`);
  }

  // =========================================================================
  // Company hierarchy operations
  // =========================================================================
  async getCompanyChildren(companyId: string) {
    return this.request(`/api/v3/io/companies/${companyId}/children`);
  }

  async switchCompany(userId: string, targetCompanyId: string) {
    return this.request('/api/v3/io/companies/switch', {
      method: 'POST',
      body: JSON.stringify({ userId, companyId: targetCompanyId }),
    });
  }
}

// =========================================================================
// Type definitions for B2B REST API responses
// =========================================================================

export interface B2BOrdersResponse {
  data: B2BOrder[];
  meta: {
    pagination: {
      totalCount: number;
      offset: number;
      limit: number;
    };
  };
}

export interface B2BOrder {
  id: number;
  bcOrderId: number;
  companyId: number;
  companyName?: string;
  totalIncTax: string;
  totalExTax: string;
  status: string;
  statusId: number;
  customStatus?: string;
  poNumber?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  currencyCode?: string;
  channelId?: number;
  channelName?: string;
  money?: Record<string, string>;
  // extraFields can contain custom data set via API
  extraFields?: Record<string, string>;
}

export interface B2BOrderDetailResponse {
  data: B2BOrder & {
    products: B2BOrderProduct[];
    billingAddress: B2BOrderAddress;
    shippingAddresses: B2BOrderAddress[];
  };
}

export interface B2BOrderProduct {
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  quantity: number;
  basePrice: string;
  totalIncTax: string;
  totalExTax: string;
  imageUrl?: string;
  options?: Array<{ name: string; value: string }>;
}

export interface B2BOrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode: string;
  phone?: string;
  email?: string;
}

export interface B2BInvoicesResponse {
  data: B2BInvoice[];
  meta: {
    pagination: {
      totalCount: number;
      offset: number;
      limit: number;
    };
  };
}

export interface B2BInvoiceBalance {
  value?: string;
  amount?: string;
  code?: string;
}

export interface B2BInvoice {
  id: number;
  customerId: string;
  externalId?: string | null;
  externalCustomerId?: string | null;
  invoiceNumber: string;
  type: string;
  dueDate: number;
  status: number;
  orderNumber?: number;
  purchaseOrderNumber?: string;
  originalBalance: B2BInvoiceBalance;
  openBalance: B2BInvoiceBalance;
  source?: number;
  channelId?: number;
  isPendingPayment?: number;
  createdAt?: number;
  updatedAt?: number;
  details?: any;
}

export interface B2BInvoiceDetailResponse {
  data: B2BInvoice;
}

export interface B2BUsersResponse {
  data: B2BUser[];
  meta: {
    pagination: {
      totalCount: number;
      offset: number;
      limit: number;
    };
  };
}

export interface B2BUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  companyId: number;
  bcCustomerId?: number;
  createdAt: string;
  updatedAt: string;
}

export const b2bRestClient = new B2BRestClient();