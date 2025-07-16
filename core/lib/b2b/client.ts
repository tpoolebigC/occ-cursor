import { z } from 'zod';

// Environment validation
const ENV = z.object({
  B2B_API_TOKEN: z.string().optional(),
  BIGCOMMERCE_CHANNEL_ID: z.string(),
  B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com/'),
});

// B2B API Response schemas
const B2BTokenResponseSchema = z.object({
  data: z.object({
    token: z.array(z.string()).nonempty({ message: 'No token returned from B2B API' }),
  }),
});

const ErrorResponse = z.object({
  detail: z.string().default('Unknown error'),
});

// B2B Profile schema
const B2BProfileSchema = z.object({
  data: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    customerGroupId: z.number().optional(),
    customerGroupName: z.string().optional(),
    taxExemptCategory: z.string().optional(),
    acceptsMarketingEmails: z.boolean().optional(),
    acceptsAbandonedCartEmails: z.boolean().optional(),
  }),
});

// Quote schemas
const QuoteConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

const QuoteItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  variantId: z.number().optional(),
  quantity: z.number(),
  listPrice: z.number(),
  salePrice: z.number(),
  extendedListPrice: z.number(),
  extendedSalePrice: z.number(),
  productName: z.string(),
  productSku: z.string(),
  productUrl: z.string().optional(),
  productImage: z.string().optional(),
  options: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.string(),
  })).optional(),
});

const QuoteSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  customerEmail: z.string(),
  status: z.string(),
  subtotal: z.number(),
  total: z.number(),
  currencyCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().optional(),
  items: z.array(QuoteItemSchema),
  notes: z.string().optional(),
});

// Order schemas
const OrderSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  status: z.string(),
  subtotal: z.number(),
  total: z.number(),
  currencyCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(QuoteItemSchema),
  billingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }).optional(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }).optional(),
});

// Shopping List schemas
const ShoppingListItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  variantId: z.number().optional(),
  quantity: z.number(),
  productName: z.string(),
  productSku: z.string(),
  productUrl: z.string().optional(),
  productImage: z.string().optional(),
  listPrice: z.number(),
  salePrice: z.number(),
  options: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.string(),
  })).optional(),
});

const ShoppingListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(ShoppingListItemSchema),
});

// B2B Client class
export class B2BClient {
  private apiHost: string;
  private apiToken: string;
  private channelId: string;
  private customerToken?: string;

  constructor() {
    const env = ENV.parse(process.env);
    this.apiHost = env.B2B_API_HOST;
    this.apiToken = env.B2B_API_TOKEN || '';
    this.channelId = env.BIGCOMMERCE_CHANNEL_ID;
  }

  setCustomerToken(token: string) {
    this.customerToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiToken) {
      throw new Error('B2B API token is not configured');
    }

    const url = `${this.apiHost}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`,
      ...options.headers,
    };

    if (this.customerToken) {
      headers['X-B2B-Token'] = this.customerToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = ErrorResponse.parse(errorData).detail;
      throw new Error(`B2B API Error (${response.status}): ${errorMessage}`);
    }

    return response.json();
  }

  // Authentication
  async loginWithB2B(customerId: number, customerAccessToken: { value: string; expiresAt: string }) {
    const response = await this.request('/api/io/auth/customers/storefront', {
      method: 'POST',
      body: JSON.stringify({
        channelId: parseInt(this.channelId, 10),
        customerId: parseInt(customerId.toString(), 10),
        customerAccessToken,
      }),
    });

    const result = B2BTokenResponseSchema.parse(response);
    this.customerToken = result.data.token[0];
    return this.customerToken;
  }

  // Profile
  async getProfile() {
    const response = await this.request('/api/io/customers/profile');
    return B2BProfileSchema.parse(response);
  }

  // Check if customer exists in B2B system
  async getCustomerProfile(customerId: number) {
    try {
      const response = await this.request(`/api/io/customers/${customerId}/profile`);
      return B2BProfileSchema.parse(response);
    } catch (error) {
      // If customer doesn't exist in B2B system, return null
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Quotes
  async getQuoteConfigs() {
    const response = await this.request('/api/io/quotes/configs');
    return z.array(QuoteConfigSchema).parse(response.data);
  }

  async getQuotes() {
    const response = await this.request('/api/io/quotes');
    return z.array(QuoteSchema).parse(response.data);
  }

  async getQuote(quoteId: number) {
    const response = await this.request(`/api/io/quotes/${quoteId}`);
    return QuoteSchema.parse(response.data);
  }

  async createQuote(data: {
    items: Array<{
      productId: number;
      variantId?: number;
      quantity: number;
      options?: Array<{ id: number; value: string }>;
    }>;
    notes?: string;
  }) {
    const response = await this.request('/api/io/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return QuoteSchema.parse(response.data);
  }

  async updateQuote(quoteId: number, data: {
    items?: Array<{
      productId: number;
      variantId?: number;
      quantity: number;
      options?: Array<{ id: number; value: string }>;
    }>;
    notes?: string;
  }) {
    const response = await this.request(`/api/io/quotes/${quoteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return QuoteSchema.parse(response.data);
  }

  async deleteQuote(quoteId: number) {
    await this.request(`/api/io/quotes/${quoteId}`, {
      method: 'DELETE',
    });
  }

  async convertQuoteToOrder(quoteId: number) {
    const response = await this.request(`/api/io/quotes/${quoteId}/convert-to-order`, {
      method: 'POST',
    });
    return OrderSchema.parse(response.data);
  }

  // Orders
  async getOrders() {
    const response = await this.request('/api/io/orders');
    return z.array(OrderSchema).parse(response.data);
  }

  async getOrder(orderId: number) {
    const response = await this.request(`/api/io/orders/${orderId}`);
    return OrderSchema.parse(response.data);
  }

  // Shopping Lists
  async getShoppingLists() {
    const response = await this.request('/api/io/shopping-lists');
    return z.array(ShoppingListSchema).parse(response.data);
  }

  async getShoppingList(listId: number) {
    const response = await this.request(`/api/io/shopping-lists/${listId}`);
    return ShoppingListSchema.parse(response.data);
  }

  async createShoppingList(data: {
    name: string;
    description?: string;
    isDefault?: boolean;
  }) {
    const response = await this.request('/api/io/shopping-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return ShoppingListSchema.parse(response.data);
  }

  async updateShoppingList(listId: number, data: {
    name?: string;
    description?: string;
    isDefault?: boolean;
  }) {
    const response = await this.request(`/api/io/shopping-lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return ShoppingListSchema.parse(response.data);
  }

  async deleteShoppingList(listId: number) {
    await this.request(`/api/io/shopping-lists/${listId}`, {
      method: 'DELETE',
    });
  }

  async addItemToShoppingList(listId: number, data: {
    productId: number;
    variantId?: number;
    quantity: number;
    options?: Array<{ id: number; value: string }>;
  }) {
    const response = await this.request(`/api/io/shopping-lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return ShoppingListItemSchema.parse(response.data);
  }

  async updateShoppingListItem(listId: number, itemId: number, data: {
    quantity?: number;
    options?: Array<{ id: number; value: string }>;
  }) {
    const response = await this.request(`/api/io/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return ShoppingListItemSchema.parse(response.data);
  }

  async removeItemFromShoppingList(listId: number, itemId: number) {
    await this.request(`/api/io/shopping-lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Quick Order
  async searchProducts(query: string, limit: number = 10) {
    const response = await this.request(`/api/io/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }

  async addToCart(items: Array<{
    productId: number;
    variantId?: number;
    quantity: number;
    options?: Array<{ id: number; value: string }>;
  }>) {
    const response = await this.request('/api/io/cart/items', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return response.data;
  }
}

// Export singleton instance
export const b2bClient = new B2BClient();

// Export types
export type B2BProfile = z.infer<typeof B2BProfileSchema>['data'];
export type QuoteConfig = z.infer<typeof QuoteConfigSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteItem = z.infer<typeof QuoteItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type ShoppingList = z.infer<typeof ShoppingListSchema>;
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>; 