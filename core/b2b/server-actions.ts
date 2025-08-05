'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Regular BigCommerce GraphQL Queries using Catalyst client
const GET_CUSTOMER_INFO = graphql(`
  query GetCustomerInfo {
    customer {
      entityId
      email
      firstName
      lastName
      company
      addresses {
        edges {
          node {
            entityId
            firstName
            lastName
            company
            address1
            address2
            city
            stateOrProvince
            countryCode
            postalCode
          }
        }
      }
    }
  }
`);

const GET_ORDERS = graphql(`
  query GetOrders($first: Int, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            entityId
            orderedAt {
              utc
            }
            status {
              value
            }
            totalIncTax {
              value
            }
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              stateOrProvince
              countryCode
              postalCode
            }
            consignments {
              shipping {
                edges {
                  node {
                    lineItems {
                      edges {
                        node {
                          entityId
                          productEntityId
                          brand
                          name
                          quantity
                          baseCatalogProduct {
                            path
                          }
                          image {
                            url: urlTemplate(lossy: true)
                            altText
                          }
                          subTotalListPrice {
                            value
                            currencyCode
                          }
                          catalogProductWithOptionSelections {
                            prices {
                              price {
                                value
                                currencyCode
                              }
                            }
                          }
                          productOptions {
                            __typename
                            name
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

// Add this GraphQL query for product search
const SEARCH_PRODUCTS = graphql(`
  query SearchProducts($searchTerm: String!) {
    site {
      search {
        searchProducts(filters: { searchTerm: $searchTerm }) {
          products {
            entityId
            name
            sku
            prices {
              price {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
            }
            defaultImage {
              url(width: 100)
              altText
            }
            description
          }
        }
      }
    }
  }
`);

// B2B REST API client for B2B-specific data
async function b2bRestClient(endpoint: string, method: string = 'GET', body?: any) {
  const session = await auth();
  
  if (!session?.b2bToken) {
    throw new Error('No B2B token available');
  }

  const B2B_API_HOST = process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com';
  const url = `${B2B_API_HOST}${endpoint}`;

  console.log('B2B REST API call:', {
    url,
    method,
    hasToken: !!session.b2bToken,
    tokenLength: session.b2bToken.length,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.b2bToken}`,
  };

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('B2B REST API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`B2B REST API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('B2B REST API success:', {
    hasData: !!result,
    dataKeys: result ? Object.keys(result) : []
  });

  return result;
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
    const session = await auth();
    console.log('Session for customer info:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasCustomerToken: !!session?.user?.customerAccessToken,
      userEmail: session?.user?.email,
    });
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available' };
    }

    const response = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    console.log('Customer info response:', response);
    return { customer: response.data.customer };
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getOrders(first: number = 10, after?: string) {
  try {
    const session = await auth();
    console.log('Session for orders:', {
      hasSession: !!session,
      hasCustomerToken: !!session?.user?.customerAccessToken,
    });
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available' };
    }

    const response = await client.fetch({
      document: GET_ORDERS,
      variables: { first, after },
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    console.log('Orders response:', response);
    return { customer: response.data.customer };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getQuotes() {
  try {
    const session = await auth();
    console.log('Session for B2B quotes:', {
      hasSession: !!session,
      hasB2bToken: !!session?.b2bToken,
    });
    
    if (!session?.b2bToken) {
      return { quotes: { edges: [] }, error: 'No B2B token available' };
    }

    // Try to get quotes from B2B REST API
    try {
      const data = await b2bRestClient('/api/io/quotes');
      console.log('B2B Quotes response:', data);
      return { quotes: { edges: data.quotes || [] } };
    } catch (b2bError) {
      console.log('B2B quotes not available, returning empty array');
      return { quotes: { edges: [] } };
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { quotes: { edges: [] }, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getInvoices(first: number = 10, after?: string) {
  try {
    const session = await auth();
    console.log('Session for invoices:', {
      hasSession: !!session,
      hasCustomerToken: !!session?.user?.customerAccessToken,
    });
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available' };
    }

    // For now, return orders as invoices since invoices are not available in regular GraphQL
    const response = await client.fetch({
      document: GET_ORDERS,
      variables: { first, after },
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    console.log('Invoices response (using orders):', response);
    return { customer: response.data.customer };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
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

    // Try Algolia search first
    try {
      const algoliasearch = (await import('algoliasearch')).default;
      const client = algoliasearch(algoliaAppId, algoliaSearchKey);
      const index = client.initIndex(algoliaIndexName);

      console.log('🔍 [Quick Order] Searching Algolia index:', algoliaIndexName);

      const response = await index.search(query, {
        hitsPerPage: 10,
        attributesToRetrieve: [
          'objectID',
          'name',
          'sku',
          'default_price',
          'sale_price',
          'default_image',
          'images',
          'prices',
          'product_id',
          'brand_name',
          'description'
        ],
      });

      console.log('🔍 [Quick Order] Algolia response:', {
        hits: response.hits.length,
        query: response.query,
        processingTimeMS: response.processingTimeMS
      });

      if (response.hits && response.hits.length > 0) {
        const products: AlgoliaProduct[] = response.hits.map((hit: any) => {
          // Robust data transformation
          const price = hit.default_price || hit.sale_price || hit.price || 0;
          const sku = hit.sku || hit.objectID || '';
          const productId = hit.product_id || parseInt(hit.objectID) || 0;
          const imageUrl = hit.default_image?.url || hit.images?.[0]?.url || '';

          return {
            objectID: hit.objectID,
            name: hit.name || '',
            sku: sku.toString(),
            price: typeof price === 'number' ? price : parseFloat(price) || 0,
            salePrice: hit.sale_price ? (typeof hit.sale_price === 'number' ? hit.sale_price : parseFloat(hit.sale_price) || 0) : undefined,
            imageUrl,
            productId,
            description: hit.description || '',
          };
        });

        console.log('🔍 [Quick Order] Transformed products:', products);
        return products;
      }
    } catch (algoliaError) {
      console.error('🔍 [Quick Order] Algolia search failed:', algoliaError);
    }

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
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      console.error('No customer access token available for GraphQL search');
      return [];
    }

    // Use the correct Catalyst search query pattern
    const SEARCH_PRODUCTS = graphql(`
      query SearchProducts($searchTerm: String!, $first: Int = 10) {
        site {
          search {
            searchProducts(filters: { searchTerm: $searchTerm }) {
              products(first: $first) {
                edges {
                  node {
                    entityId
                    name
                    sku
                    prices {
                      price {
                        value
                        currencyCode
                      }
                      salePrice {
                        value
                        currencyCode
                      }
                    }
                    defaultImage {
                      url(width: 100)
                      altText
                    }
                    description
                  }
                }
              }
            }
          }
        }
      }
    `);

    const response = await client.fetch({
      document: SEARCH_PRODUCTS,
      variables: { 
        searchTerm: query,
        first: 10
      },
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    console.log('🔍 [Quick Order] GraphQL Search Response:', response);

    const products = response.data?.site?.search?.searchProducts?.products?.edges || [];
    
    return products.map((edge: any) => {
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
    });
  } catch (error) {
    console.error('🔍 [Quick Order] Error in GraphQL product search:', error);
    return [];
  }
} 