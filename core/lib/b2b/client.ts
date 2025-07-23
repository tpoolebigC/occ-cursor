import { GraphQLClient } from 'graphql-request';

const B2B_API_URL = process.env.NEXT_PUBLIC_B2B_API_URL || 'https://api.bigcommerce.com/graphql';
const B2B_STORE_HASH = process.env.NEXT_PUBLIC_B2B_STORE_HASH;
const B2B_CLIENT_ID = process.env.NEXT_PUBLIC_B2B_CLIENT_ID;
const B2B_CLIENT_SECRET = process.env.B2B_CLIENT_SECRET;

export const b2bClient = new GraphQLClient(B2B_API_URL, {
  headers: {
    'X-Auth-Token': `${B2B_CLIENT_ID}:${B2B_CLIENT_SECRET}`,
    'Content-Type': 'application/json',
  },
});

// Customer-specific client for authenticated requests
export function createCustomerClient(customerToken: string) {
  return new GraphQLClient(B2B_API_URL, {
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json',
    },
  });
}

// B2B API endpoints
export const B2B_ENDPOINTS = {
  customers: '/customers',
  orders: '/orders',
  quotes: '/quotes',
  products: '/catalog/products',
  categories: '/catalog/categories',
} as const; 