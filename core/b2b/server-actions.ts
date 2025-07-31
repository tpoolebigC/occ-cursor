'use server';

import { createClient } from '@bigcommerce/catalyst-client';
import { revalidatePath } from 'next/cache';

// B2B GraphQL Queries
const GET_CUSTOMER_INFO = `
  query GetCustomerInfo {
    customer {
      entityId
      email
      firstName
      lastName
      company
      phone
      notes
      taxExemptCategory
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
            stateOrProvince
            countryCode
            postalCode
            phone
            addressType
          }
        }
      }
    }
  }
`;

const GET_ORDERS = `
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
            id
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

          }
        }
      }
    }
  }
`;

const GET_QUOTES = `
  query GetQuotes {
    customer {
      entityId
      email
      firstName
      lastName
    }
  }
`;

const GET_PRODUCTS = `
  query GetProducts($first: Int, $after: String, $searchTerm: String) {
    products(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          productId
          name
          sku
          description
          price
          salePrice
          retailPrice
          weight
          width
          height
          depth
          isVisible
          isFeatured
          categories {
            id
            name
          }
          images {
            url
            altText
            sortOrder
          }
          variants {
            id
            sku
            optionValues {
              optionEntityId
              optionValueEntityId
            }
            purchasable
            inventoryLevel
            price
            salePrice
            retailPrice
          }
        }
      }
    }
  }
`;

// Create B2B client
function createB2BClient(customerAccessToken?: string) {
  return createClient({
    storeHash: process.env.BIGCOMMERCE_STORE_HASH!,
    storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN!,
    channelId: process.env.BIGCOMMERCE_CHANNEL_ID!,
    platform: 'catalyst',
    beforeRequest: async (fetchOptions) => {
      // Add B2B-specific headers for regular GraphQL API
      const headers = new Headers(fetchOptions.headers);
      headers.set('X-BC-B2B-Token', process.env.B2B_API_TOKEN || '');
      headers.set('X-BC-B2B-Host', process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com');
      
      return {
        ...fetchOptions,
        headers,
      };
    },
  });
}

// Server Actions

export async function getCustomerInfo(customerAccessToken?: string) {
  'use server';
  
  try {
    const client = createB2BClient(customerAccessToken);
    
    const response = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken,
      errorPolicy: 'all',
    });

    if (response.errors) {
      console.error('B2B Customer Info Errors:', response.errors);
      throw new Error('Failed to fetch customer info');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('B2B Customer Info Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getOrders(
  first: number = 10,
  after?: string,
  customerAccessToken?: string
) {
  'use server';
  
  try {
    const client = createB2BClient(customerAccessToken);
    
    const response = await client.fetch({
      document: GET_ORDERS,
      variables: { first, after },
      customerAccessToken,
      errorPolicy: 'all',
    });

    if (response.errors) {
      console.error('B2B Orders Errors:', response.errors);
      throw new Error('Failed to fetch orders');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('B2B Orders Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getQuotes(
  first: number = 10,
  after?: string,
  customerAccessToken?: string
) {
  'use server';
  
  try {
    const client = createB2BClient(customerAccessToken);
    
    const response = await client.fetch({
      document: GET_QUOTES,
      variables: { first, after },
      customerAccessToken,
      errorPolicy: 'all',
    });

    if (response.errors) {
      console.error('B2B Quotes Errors:', response.errors);
      throw new Error('Failed to fetch quotes');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('B2B Quotes Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getProducts(
  first: number = 10,
  after?: string,
  searchTerm?: string,
  customerAccessToken?: string
) {
  'use server';
  
  try {
    const client = createB2BClient(customerAccessToken);
    
    const response = await client.fetch({
      document: GET_PRODUCTS,
      variables: { first, after, searchTerm },
      customerAccessToken,
      errorPolicy: 'all',
    });

    if (response.errors) {
      console.error('B2B Products Errors:', response.errors);
      throw new Error('Failed to fetch products');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('B2B Products Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function searchProducts(
  searchTerm: string,
  first: number = 20,
  customerAccessToken?: string
) {
  'use server';
  
  if (!searchTerm.trim()) {
    return {
      success: true,
      data: { products: { edges: [], pageInfo: {} } },
    };
  }

  return getProducts(first, undefined, searchTerm, customerAccessToken);
}

// Revalidation actions
export async function revalidateB2BData() {
  'use server';
  
  revalidatePath('/b2b');
  revalidatePath('/account');
}

// Types for better TypeScript support
export interface Customer {
  entityId: number;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  notes?: string;
  taxExemptCategory?: string;
  addresses: {
    edges: Array<{
      node: Address;
    }>;
  };
}

export interface Address {
  entityId: number;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  stateOrProvince: string;
  stateOrProvinceCode?: string;
  countryCode: string;
  postalCode: string;
  phone?: string;
  addressType: string;
}

export interface Order {
  id: string;
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

export interface LineItems {
  physicalItems: PhysicalItem[];
  digitalItems: DigitalItem[];
}

export interface PhysicalItem {
  id: string;
  productId: number;
  variantId: number;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: {
    value: number;
  };
  totalPrice: {
    value: number;
  };
  imageUrl?: string;
}

export interface DigitalItem {
  id: string;
  productId: number;
  variantId: number;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: {
    value: number;
  };
  totalPrice: {
    value: number;
  };
}

export interface Quote {
  entityId: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Product {
  id: string;
  productId: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  retailPrice?: number;
  weight: number;
  width: number;
  height: number;
  depth: number;
  isVisible: boolean;
  isFeatured: boolean;
  categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  optionValues: OptionValue[];
  purchasable: boolean;
  inventoryLevel: number;
  price: number;
  salePrice?: number;
  retailPrice?: number;
}

export interface OptionValue {
  optionEntityId: number;
  optionValueEntityId: number;
} 