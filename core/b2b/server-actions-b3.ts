'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Import B3Storage utilities
import { 
  getB3Storage, 
  isB3StorageAvailable, 
  getB2BToken, 
  getB2BUserId, 
  getCompanyInfo,
  waitForB3Storage 
} from './utils/b3StorageUtils';

// B2B REST API client for when B3Storage is not available
async function b2bRestClient(endpoint: string, method: string = 'GET', body?: any) {
  const { B2B_API_HOST, B2B_API_TOKEN } = {
    B2B_API_HOST: process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com',
    B2B_API_TOKEN: process.env.B2B_API_TOKEN,
  };

  if (!B2B_API_TOKEN) {
    throw new Error('B2B API token not configured');
  }

  const response = await fetch(`${B2B_API_HOST}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${B2B_API_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`B2B API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// GraphQL queries for fallback
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
            physicalItems {
              edges {
                node {
                  entityId
                  productEntityId
                  name
                  sku
                  quantity
                  image {
                    url: urlTemplate(lossy: true)
                    altText
                  }
                  subTotalListPrice {
                    value
                    currencyCode
                  }
                }
              }
            }
            digitalItems {
              edges {
                node {
                  entityId
                  productEntityId
                  name
                  sku
                  quantity
                  subTotalListPrice {
                    value
                    currencyCode
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

// Enhanced customer info that tries B3Storage first
export async function getCustomerInfoB3() {
  try {
    // Try B3Storage first
    if (isB3StorageAvailable()) {
      const b3Data = getB3Storage();
      const companyInfo = getCompanyInfo();
      
      console.log('Using B3Storage for customer info:', b3Data);
      
      return {
        customer: {
          entityId: b3Data?.B3UserId,
          email: b3Data?.B3Email,
          firstName: companyInfo?.firstName || 'B2B',
          lastName: companyInfo?.lastName || 'User',
          company: b3Data?.B3CompanyName,
          companyInfo: companyInfo,
          b2bData: b3Data,
        },
        source: 'B3Storage'
      };
    }

    // Fallback to regular GraphQL
    console.log('B3Storage not available, using GraphQL fallback');
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available', source: 'GraphQL' };
    }

    const response = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    return { customer: response.data.customer, source: 'GraphQL' };
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error', source: 'Error' };
  }
}

// Enhanced orders that tries B3Storage first
export async function getOrdersB3(first: number = 10, after?: string) {
  try {
    // Try B3Storage first
    if (isB3StorageAvailable()) {
      const b2bToken = getB2BToken();
      const userId = getB2BUserId();
      
      if (b2bToken && userId) {
        console.log('Using B3Storage for orders');
        
        // Use B2B REST API with B3Storage token
        try {
          const data = await b2bRestClient(`/api/io/customers/${userId}/orders?limit=${first}`, 'GET');
          
          return {
            customer: {
              orders: {
                edges: data.orders?.map((order: any) => ({ node: order })) || [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                }
              }
            },
            source: 'B3Storage'
          };
        } catch (b2bError) {
          console.log('B2B orders not available via REST, falling back to GraphQL');
        }
      }
    }

    // Fallback to regular GraphQL
    console.log('Using GraphQL fallback for orders');
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available', source: 'GraphQL' };
    }

    const response = await client.fetch({
      document: GET_ORDERS,
      variables: { first, after },
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    return { customer: response.data.customer, source: 'GraphQL' };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error', source: 'Error' };
  }
}

// Enhanced quotes that tries B3Storage first
export async function getQuotesB3() {
  try {
    // Try B3Storage first
    if (isB3StorageAvailable()) {
      const b2bToken = getB2BToken();
      const userId = getB2BUserId();
      
      if (b2bToken && userId) {
        console.log('Using B3Storage for quotes');
        
        try {
          const data = await b2bRestClient(`/api/io/customers/${userId}/quotes`, 'GET');
          
          return {
            quotes: { edges: data.quotes || [] },
            source: 'B3Storage'
          };
        } catch (b2bError) {
          console.log('B2B quotes not available via REST, returning empty array');
          return { quotes: { edges: [] }, source: 'B3Storage' };
        }
      }
    }

    // Fallback to regular approach
    console.log('Using fallback for quotes');
    const session = await auth();
    
    if (!session?.b2bToken) {
      return { quotes: { edges: [] }, error: 'No B2B token available', source: 'Fallback' };
    }

    try {
      const data = await b2bRestClient('/api/io/quotes');
      return { quotes: { edges: data.quotes || [] }, source: 'Fallback' };
    } catch (b2bError) {
      console.log('B2B quotes not available, returning empty array');
      return { quotes: { edges: [] }, source: 'Fallback' };
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { quotes: { edges: [] }, error: error instanceof Error ? error.message : 'Unknown error', source: 'Error' };
  }
}

// Enhanced invoices that tries B3Storage first
export async function getInvoicesB3(first: number = 10, after?: string) {
  try {
    // Try B3Storage first
    if (isB3StorageAvailable()) {
      const b2bToken = getB2BToken();
      const userId = getB2BUserId();
      
      if (b2bToken && userId) {
        console.log('Using B3Storage for invoices');
        
        try {
          const data = await b2bRestClient(`/api/io/customers/${userId}/invoices?limit=${first}`, 'GET');
          
          return {
            customer: {
              orders: {
                edges: data.invoices?.map((invoice: any) => ({ node: invoice })) || [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                }
              }
            },
            source: 'B3Storage'
          };
        } catch (b2bError) {
          console.log('B2B invoices not available via REST, falling back to orders');
        }
      }
    }

    // Fallback to orders as invoices
    console.log('Using GraphQL fallback for invoices (orders)');
    const session = await auth();
    
    if (!session?.user?.customerAccessToken) {
      return { customer: null, error: 'No customer access token available', source: 'GraphQL' };
    }

    const response = await client.fetch({
      document: GET_ORDERS,
      variables: { first, after },
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });
    
    return { customer: response.data.customer, source: 'GraphQL' };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error', source: 'Error' };
  }
}

// Wait for B3Storage to become available
export async function waitForB3StorageData(timeoutMs: number = 10000) {
  try {
    const data = await waitForB3Storage(timeoutMs);
    return { success: true, data, source: 'B3Storage' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Timeout', source: 'Timeout' };
  }
} 