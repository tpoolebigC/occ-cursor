/**
 * BigCommerce Management API Client (V2 + V3)
 *
 * @deprecated This client is being replaced by the B2B GraphQL API client
 * at `~/b2b/graphql`. The B2B GraphQL API returns all order data (including
 * external_order_id, payment info, products, shipping addresses) in a single
 * query -- eliminating the need for V2 enrichment calls.
 *
 * Migration path:
 * - V2 Order data:     import { getOrderDetail } from '~/b2b/graphql'
 * - V2 Order products: included in getOrderDetail() response
 * - V2 Shipping addrs: included in getOrderDetail() response
 *
 * This file is kept temporarily for edge cases during migration.
 */

class BCManagementApiError extends Error {
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

export class BCManagementClient {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    const storeHash = process.env.BIGCOMMERCE_STORE_HASH || '';
    this.accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN || '';

    if (!storeHash) {
      throw new Error('BIGCOMMERCE_STORE_HASH is required for BC Management API calls');
    }

    if (!this.accessToken) {
      throw new Error(
        'BIGCOMMERCE_ACCESS_TOKEN is required for BC Management API calls. ' +
        'Create a V2/V3 API account token in the BigCommerce control panel.',
      );
    }

    this.baseUrl = `https://api.bigcommerce.com/stores/${storeHash}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 0,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = 3;
    const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Auth-Token': this.accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

      throw new BCManagementApiError(
        `BC Management API error: ${response.status} ${response.statusText}`,
        response.status,
        url,
        responseText,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  // =========================================================================
  // V2 Orders (includes external_order_id for ERP Order #)
  // =========================================================================

  /**
   * Get a single V2 order -- includes `external_order_id` (ERP Order #).
   */
  async getV2Order(orderId: number): Promise<BCv2Order> {
    return this.request<BCv2Order>(`/v2/orders/${orderId}`);
  }

  /**
   * Get multiple V2 orders with optional filters.
   */
  async getV2Orders(params: {
    min_id?: number;
    max_id?: number;
    customer_id?: number;
    status_id?: number;
    limit?: number;
    page?: number;
    sort?: string;
  } = {}): Promise<BCv2Order[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const qs = searchParams.toString();
    return this.request<BCv2Order[]>(`/v2/orders${qs ? `?${qs}` : ''}`);
  }

  /**
   * Update a V2 order (e.g. to set external_order_id).
   */
  async updateV2Order(orderId: number, data: Partial<BCv2OrderUpdate>): Promise<BCv2Order> {
    return this.request<BCv2Order>(`/v2/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get line items (products) for a V2 order.
   */
  async getV2OrderProducts(orderId: number): Promise<BCv2OrderProduct[]> {
    return this.request<BCv2OrderProduct[]>(`/v2/orders/${orderId}/products`);
  }

  /**
   * Get shipping addresses for a V2 order.
   */
  async getV2OrderShippingAddresses(orderId: number): Promise<any[]> {
    return this.request<any[]>(`/v2/orders/${orderId}/shipping_addresses`);
  }

  /**
   * Batch-fetch V2 orders by an array of order IDs.
   * Returns a map of orderId -> BCv2Order for easy merging.
   */
  async getV2OrdersByIds(orderIds: number[]): Promise<Map<number, BCv2Order>> {
    if (orderIds.length === 0) return new Map();

    // V2 API supports filtering by min_id/max_id but not an array of IDs.
    // For small sets, fetch individually in parallel. For large sets, fetch by range.
    const uniqueIds = [...new Set(orderIds)];

    if (uniqueIds.length <= 10) {
      // Parallel individual fetches
      const results = await Promise.allSettled(
        uniqueIds.map((id) => this.getV2Order(id)),
      );
      const map = new Map<number, BCv2Order>();
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          map.set(result.value.id, result.value);
        }
      });
      return map;
    }

    // Range-based fetch for larger sets
    const minId = Math.min(...uniqueIds);
    const maxId = Math.max(...uniqueIds);
    const allOrders: BCv2Order[] = [];
    let page = 1;
    const limit = 250;

    // Paginate through the range
    while (true) {
      const batch = await this.getV2Orders({
        min_id: minId,
        max_id: maxId,
        limit,
        page,
      });

      if (!batch || batch.length === 0) break;
      allOrders.push(...batch);
      if (batch.length < limit) break;
      page++;
    }

    const map = new Map<number, BCv2Order>();
    const idSet = new Set(uniqueIds);
    allOrders.forEach((order) => {
      if (idSet.has(order.id)) {
        map.set(order.id, order);
      }
    });
    return map;
  }

  // =========================================================================
  // V3 Catalog Products
  // =========================================================================

  async getProductVariants(productId: number) {
    return this.request<{ data: Array<{ id: number; product_id: number; sku: string; price: number; purchasing_disabled: boolean }> }>(
      `/v3/catalog/products/${productId}/variants`,
    );
  }

  // =========================================================================
  // V3 Carts (Management API -- supports list_price overrides)
  // =========================================================================

  /**
   * Add a line item to an existing cart with optional list_price override.
   * This uses the Management API which supports price overrides and option selections,
   * unlike the Storefront GraphQL which only accepts Int quantities.
   */
  async addCartLineItem(
    cartId: string,
    item: {
      product_id: number;
      variant_id?: number;
      quantity: number;
      list_price?: number;
      option_selections?: Array<{
        option_id: number;
        option_value: string;
      }>;
    },
  ) {
    return this.request<{ data: any }>(`/v3/carts/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        line_items: [item],
      }),
    });
  }

  /**
   * Create a new cart with line items. Supports list_price overrides.
   */
  async createCart(
    items: Array<{
      product_id: number;
      variant_id?: number;
      quantity: number;
      list_price?: number;
      option_selections?: Array<{
        option_id: number;
        option_value: string;
      }>;
    }>,
    channelId?: number,
    customerId?: number,
  ) {
    const body: any = {
      line_items: items,
    };
    if (channelId) body.channel_id = channelId;
    if (customerId) body.customer_id = customerId;

    return this.request<{ data: any }>('/v3/carts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get cart redirect URLs (works across channels unlike Storefront GraphQL).
   */
  async getCartRedirectUrls(cartId: string) {
    return this.request<{ data: { cart_url: string; checkout_url: string; embedded_checkout_url: string } }>(
      `/v3/carts/${cartId}/redirect_urls`,
      { method: 'POST' },
    );
  }

  // =========================================================================
  // V3 Orders (metadata, metafields)
  // =========================================================================

  async getV3OrderMetafields(orderId: number) {
    return this.request<{ data: BCv3Metafield[] }>(`/v3/orders/${orderId}/metafields`);
  }

  async createV3OrderMetafield(orderId: number, data: Omit<BCv3Metafield, 'id'>) {
    return this.request<{ data: BCv3Metafield }>(`/v3/orders/${orderId}/metafields`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =========================================================================
  // V3 Customers
  // =========================================================================

  async getCustomers(params: { 'id:in'?: number[]; email?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params['id:in']?.length) searchParams.append('id:in', params['id:in'].join(','));
    if (params.email) searchParams.append('email:in', params.email);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();
    return this.request<{ data: BCv3Customer[] }>(`/v3/customers${qs ? `?${qs}` : ''}`);
  }
}

// =========================================================================
// Type definitions for BC Management API
// =========================================================================

export interface BCv2Order {
  id: number;
  customer_id: number;
  date_created: string;
  date_modified: string;
  date_shipped?: string;
  status_id: number;
  status: string;
  subtotal_ex_tax: string;
  subtotal_inc_tax: string;
  subtotal_tax: string;
  base_shipping_cost: string;
  shipping_cost_ex_tax: string;
  shipping_cost_inc_tax: string;
  shipping_cost_tax: string;
  handling_cost_ex_tax: string;
  handling_cost_inc_tax: string;
  total_ex_tax: string;
  total_inc_tax: string;
  total_tax: string;
  items_total: number;
  items_shipped: number;
  payment_method: string;
  payment_status?: string;
  // ERP Order # fields
  external_id?: string;           // read-only system field
  external_order_id?: string;     // writable ERP Order # field
  external_merchant_id?: string;
  external_source?: string;
  currency_code: string;
  channel_id: number;
  order_source?: string;
  billing_address: BCv2Address;
  staff_notes?: string;
  customer_message?: string;
  discount_amount?: string;
  coupon_discount?: string;
  ip_address?: string;
  custom_status?: string;
}

export interface BCv2OrderUpdate {
  status_id: number;
  external_order_id: string;  // writable ERP Order # field
  staff_notes: string;
  customer_message: string;
}

export interface BCv2Address {
  first_name: string;
  last_name: string;
  company?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone?: string;
  email?: string;
}

export interface BCv3Metafield {
  id?: number;
  key: string;
  value: string;
  namespace: string;
  permission_set: 'app_only' | 'read' | 'write' | 'read_and_sf_access' | 'write_and_sf_access';
  description?: string;
}

export interface BCv3Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  date_created: string;
  date_modified: string;
  customer_group_id: number;
  notes?: string;
}

export interface BCv2OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  name: string;
  name_customer: string;
  sku: string;
  type: string;
  base_price: string;
  price_ex_tax: string;
  price_inc_tax: string;
  total_ex_tax: string;
  total_inc_tax: string;
  quantity: number;
  quantity_shipped: number;
  is_refunded: boolean;
  quantity_refunded: number;
  product_options: Array<{
    id: number;
    option_id: number;
    order_product_id: number;
    product_option_id: number;
    display_name: string;
    display_value: string;
    value: string;
    type: string;
    name: string;
    display_style: string;
  }>;
  brand?: string;
}

// Singleton instance
export const bcManagementClient = new BCManagementClient();
