'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Import our centralized B2B GraphQL client
import {
  getCustomerInfo as getCustomerInfoClient,
  getOrders as getOrdersClient,
  getOrderDetail as getOrderDetailClient,
  searchProducts as searchProductsClient,
  getCart as getCartClient,
  type CustomerInfo,
  type OrdersResponse,
  type OrderDetail,
  type SearchProductsResponse,
  type CartResponse
} from './client/b2b-graphql-client';

// B2B REST API client for B2B-specific data (placeholder for future B2B API integration)
async function b2bRestClient(endpoint: string, method: string = 'GET', body?: any) {
  console.log('B2B REST API call (placeholder):', { endpoint, method });
  throw new Error('B2B REST API not yet implemented - using GraphQL only');
}

// TypeScript Interfaces
export interface Address {
  entityId: number;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  stateOrProvince: string;
  countryCode: string;
  postalCode: string;
}

export interface Customer {
  entityId: number;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  addresses?: {
    edges: Array<{
      node: Address;
    }>;
  };
}

// Update the Order interface to include physicalItems and digitalItems
export interface Order {
  entityId: number;
  orderedAt: {
    utc: string;
  };
  status: {
    value: string;
  };
  totalIncTax: {
    value: number;
  };
  billingAddress: Address;
  consignments?: {
    shipping?: {
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
                baseCatalogProduct?: {
                  path: string;
                };
                image?: {
                  url?: string;
                  altText?: string;
                };
                subTotalListPrice: {
                  value: number;
                  currencyCode: string;
                };
                catalogProductWithOptionSelections?: {
                  prices?: {
                    price?: {
                      value: number;
                      currencyCode: string;
                    };
                  };
                };
                productOptions?: Array<{
                  __typename: string;
                  name: string;
                  value: string;
                }>;
              };
            }>;
          };
        };
      }>;
    };
  };
}

export interface Quote {
  entityId: number;
  name: string;
  status: string;
  createdAt: {
    utc: string;
  };
  totalIncTax: {
    value: number;
  };
}

export interface Invoice {
  entityId: number;
  orderedAt: {
    utc: string;
  };
  status: {
    value: string;
  };
  totalIncTax: {
    value: number;
  };
  billingAddress: Address;
}

export interface AlgoliaProduct {
  objectID: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  productId: number;
  description?: string;
}

// Server Actions
export async function getCustomerInfo() {
  try {
    const customer = await getCustomerInfoClient();
    return { customer, error: null };
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getOrders(first: number = 10, after?: string) {
  try {
    const orders = await getOrdersClient(first, after);
    return { customer: { orders }, error: null };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getQuotes() {
  try {
    // For now, return empty quotes since we're not using B2B API
    console.log('Quotes not yet implemented - using GraphQL only');
    return { quotes: { edges: [] }, error: null };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { quotes: { edges: [] }, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getInvoices(first: number = 10, after?: string) {
  try {
    // For now, return orders as invoices since invoices are not available in regular GraphQL
    const orders = await getOrdersClient(first, after);
    return { customer: { orders }, error: null };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCart() {
  try {
    const cart = await getCartClient();
    return { cart, error: null };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { cart: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function searchAlgoliaProducts(query: string): Promise<AlgoliaProduct[]> {
  if (!query.trim()) return [];

  console.log('🔍 [Quick Order] Starting search for:', query);

  try {
    // Check if Algolia environment variables are available
    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const algoliaSearchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
    const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

    if (!algoliaAppId || !algoliaSearchKey || !algoliaIndexName) {
      console.log('🔍 [Quick Order] Algolia environment variables not found, falling back to GraphQL');
      return await searchProductsGraphQL(query);
    }

    // Algolia search temporarily disabled - will be re-enabled when import issues are resolved
    // try {
    //   const algoliasearch = (await import('algoliasearch')).default;
    //   const client = algoliasearch(algoliaAppId, algoliaSearchKey);
    //   const index = client.initIndex(algoliaIndexName);
    //   // ... rest of Algolia search logic
    // } catch (algoliaError) {
    //   console.error('🔍 [Quick Order] Algolia search failed:', algoliaError);
    // }

    // Fallback to GraphQL search
    console.log('🔍 [Quick Order] Falling back to GraphQL search');
    return await searchProductsGraphQL(query);
  } catch (error) {
    console.error('🔍 [Quick Order] Search failed:', error);
    return [];
  }
}

// Fallback GraphQL search function
async function searchProductsGraphQL(query: string): Promise<AlgoliaProduct[]> {
  try {
    const products = await searchProductsClient(query, 10);
    
    return products?.edges?.map((edge: any) => {
      const product = edge.node;
      const price = product.prices?.price?.value || product.prices?.salePrice?.value || 0;
      
      return {
        objectID: product.entityId.toString(),
        name: product.name,
        sku: product.sku || 'N/A',
        price: price,
        salePrice: product.prices?.salePrice?.value,
        imageUrl: product.defaultImage?.url,
        productId: product.entityId,
        description: product.description || '',
      };
    }) || [];
  } catch (error) {
    console.error('🔍 [Quick Order] Error in GraphQL product search:', error);
    return [];
  }
} 