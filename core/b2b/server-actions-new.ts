/**
 * B2B Server Actions - New Implementation
 * 
 * This file contains server actions that use the B2B client with gql-tada
 * instead of relying on B2B buyer portal or B3Storage dependencies.
 */

import { auth } from '~/auth';
import { b2bRestClient } from '~/client/b2b-client';
import { 
  getB2BCustomer, 
  getB2BOrders, 
  getB2BOrder, 
  searchB2BProducts 
} from '~/client/queries/b2b-queries';

// Types for B2B data
export interface B2BCustomer {
  entityId: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  addresses: {
    edges: Array<{
      node: {
        entityId: number;
        firstName: string;
        lastName: string;
        company: string;
        address1: string;
        address2: string;
        city: string;
        stateOrProvince: string;
        countryCode: string;
        postalCode: string;
      };
    }>;
  };
}

export interface B2BOrder {
  entityId: number;
  orderedAt: { utc: string };
  status: { value: string };
  totalIncTax: { value: number; currencyCode: string };
  billingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    countryCode: string;
    postalCode: string;
  };
  consignments: {
    shipping: {
      edges: Array<{
        node: {
          lineItems: {
            edges: Array<{
              node: {
                entityId: number;
                productEntityId: number;
                brand: string;
                name: string;
                quantity: number;
                baseCatalogProduct: { path: string };
                image: { url: string; altText: string };
                subTotalListPrice: { value: number; currencyCode: string };
                catalogProductWithOptionSelections: {
                  prices: {
                    price: { value: number; currencyCode: string };
                  };
                };
                productOptions: Array<{
                  entityId: number;
                  displayName: string;
                  values: {
                    edges: Array<{
                      node: {
                        entityId: number;
                        label: string;
                      };
                    }>;
                  };
                }>;
              };
            }>;
          };
        };
      }>;
    };
  };
}

export interface B2BProduct {
  entityId: number;
  name: string;
  sku: string;
  brand: string;
  prices: {
    price: { value: number; currencyCode: string };
    salePrice?: { value: number; currencyCode: string };
  };
  defaultImage: { url: string; altText: string };
  description: string;
  inventoryLevel: number;
  availabilityV2: { status: string };
}

// Server Actions

/**
 * Get B2B customer information
 */
export async function getCustomerInfo(): Promise<{
  customer: B2BCustomer | null;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available' };
    }

    console.log('Session for customer info:', {
      hasSession: true,
      hasUser: true,
      hasCustomerToken: true,
      userEmail: session.user.email
    });

    const result = await getB2BCustomer();
    
    if (result.error) {
      return { customer: null, error: result.error };
    }

    console.log('Customer info response:', {
      data: { customer: result.customer }
    });

    return { customer: result.customer, error: null };
  } catch (error) {
    console.error('Error in getCustomerInfo:', error);
    return { 
      customer: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B orders
 */
export async function getOrders(first: number = 50): Promise<{
  orders: { edges: Array<{ node: B2BOrder }>; pageInfo: any } | null;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { orders: null, error: 'No customer access token available' };
    }

    console.log('Session for orders:', {
      hasSession: true,
      hasCustomerToken: true
    });

    const result = await getB2BOrders(first);
    
    if (result.error) {
      return { orders: null, error: result.error };
    }

    console.log('Orders response:', {
      data: { customer: { orders: result.orders } }
    });

    return { orders: result.orders, error: null };
  } catch (error) {
    console.error('Error in getOrders:', error);
    return { 
      orders: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B order details
 */
export async function getOrder(orderId: number): Promise<{
  order: B2BOrder | null;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { order: null, error: 'No customer access token available' };
    }

    const result = await getB2BOrder(orderId);
    
    if (result.error) {
      return { order: null, error: result.error };
    }

    return { order: result.order, error: null };
  } catch (error) {
    console.error('Error in getOrder:', error);
    return { 
      order: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B quotes using REST API
 */
export async function getQuotes(): Promise<{
  quotes: any;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.b2bToken) {
      return { quotes: { edges: [] }, error: null };
    }

    console.log('Session for B2B quotes:', {
      hasSession: true,
      hasB2bToken: true
    });

    console.log('B2B REST API call:', {
      url: `${process.env.B2B_API_HOST}/api/io/quotes`,
      method: 'GET',
      hasToken: true,
      tokenLength: session.user.b2bToken?.length || 0
    });

    try {
      const quotes = await b2bRestClient.getQuotes();
      return { quotes, error: null };
    } catch (error) {
      console.log('B2B REST API error:', {
        status: error instanceof Error ? 'Unknown' : 'Unknown',
        statusText: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('B2B quotes not available, returning empty array');
      return { quotes: { edges: [] }, error: null };
    }
  } catch (error) {
    console.error('Error in getQuotes:', error);
    return { 
      quotes: { edges: [] }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B invoices (using orders data for now)
 */
export async function getInvoices(first: number = 50): Promise<{
  invoices: { edges: Array<{ node: B2BOrder }>; pageInfo: any } | null;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { invoices: null, error: 'No customer access token available' };
    }

    console.log('Session for invoices:', {
      hasSession: true,
      hasCustomerToken: true
    });

    // For now, we'll use orders data as invoices
    // In the future, we can implement proper invoice API calls
    const result = await getB2BOrders(first);
    
    if (result.error) {
      return { invoices: null, error: result.error };
    }

    console.log('Invoices response (using orders):', {
      data: { customer: { orders: result.orders } }
    });

    return { invoices: result.orders, error: null };
  } catch (error) {
    console.error('Error in getInvoices:', error);
    return { 
      invoices: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Search B2B products
 */
export async function searchProducts(searchTerm: string): Promise<{
  products: B2BProduct[] | null;
  error: string | null;
}> {
  try {
    console.log('🔍 [B2B Search] Environment check:', {
      searchTerm,
      nodeEnv: process.env.NODE_ENV
    });

    const result = await searchB2BProducts(searchTerm);
    
    if (result.error) {
      return { products: null, error: result.error };
    }

    // Transform the data to match expected format
    const products = result.products?.edges?.map((edge: any) => ({
      productId: edge.node.entityId,
      name: edge.node.name,
      sku: edge.node.sku,
      price: edge.node.prices.price.value,
      salePrice: edge.node.prices.salePrice?.value || null,
      imageUrl: edge.node.defaultImage.url,
      brand: edge.node.brand || '',
      description: edge.node.description || '',
      inventoryLevel: edge.node.inventoryLevel || 0,
      availability: edge.node.availabilityV2?.status || 'Unknown'
    })) || [];

    return { products, error: null };
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return { 
      products: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B shopping lists
 */
export async function getShoppingLists(): Promise<{
  shoppingLists: any;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.b2bToken) {
      return { shoppingLists: { edges: [] }, error: null };
    }

    try {
      const shoppingLists = await b2bRestClient.getShoppingLists();
      return { shoppingLists, error: null };
    } catch (error) {
      console.log('B2B shopping lists not available:', error);
      return { shoppingLists: { edges: [] }, error: null };
    }
  } catch (error) {
    console.error('Error in getShoppingLists:', error);
    return { 
      shoppingLists: { edges: [] }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get B2B addresses
 */
export async function getAddresses(): Promise<{
  addresses: any;
  error: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.b2bToken) {
      return { addresses: { edges: [] }, error: null };
    }

    try {
      const addresses = await b2bRestClient.getAddresses();
      return { addresses, error: null };
    } catch (error) {
      console.log('B2B addresses not available:', error);
      return { addresses: { edges: [] }, error: null };
    }
  } catch (error) {
    console.error('Error in getAddresses:', error);
    return { 
      addresses: { edges: [] }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 