import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';

import { b2bClient } from '../b2b-client';
import { graphql } from '../graphql';
import { TAGS } from '../tags';

// Money field fragment for consistent pricing display
const MoneyFieldFragment = graphql(`
  fragment MoneyFieldFragment on Money {
    currencyCode
    value
  }
`);

// Customer information fragment
const CustomerInfoFragment = graphql(`
  fragment CustomerInfoFragment on Customer {
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
`);

// Order line item fragment
const OrderLineItemFragment = graphql(`
  fragment OrderLineItemFragment on OrderPhysicalLineItem {
    entityId
    productEntityId
    brand
    name
    quantity
    baseCatalogProduct {
      path
    }
    image {
      url
      altText
    }
    subTotalListPrice {
      ...MoneyFieldFragment
    }
    catalogProductWithOptionSelections {
      prices {
        price {
          ...MoneyFieldFragment
        }
      }
    }
    productOptions {
      entityId
      displayName
      values {
        edges {
          node {
            entityId
            label
          }
        }
      }
    }
  }
`);

// Main customer query with B2B-specific fields
export const GetB2BCustomerQuery = graphql(`
  query GetB2BCustomer {
    customer {
      ...CustomerInfoFragment
    }
  }
`);

// B2B orders query with enhanced line item details
export const GetB2BOrdersQuery = graphql(`
  query GetB2BOrders($first: Int = 50, $after: String) {
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
              ...MoneyFieldFragment
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
                          ...OrderLineItemFragment
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

// B2B order details query
export const GetB2BOrderQuery = graphql(`
  query GetB2BOrder($orderId: Int!) {
    customer {
      order(entityId: $orderId) {
        entityId
        orderedAt {
          utc
        }
        status {
          value
        }
        totalIncTax {
          ...MoneyFieldFragment
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
        shippingAddress {
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
                      ...OrderLineItemFragment
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

// B2B product search query
export const SearchB2BProductsQuery = graphql(`
  query SearchB2BProducts($searchTerm: String!, $first: Int = 20) {
    site {
      search {
        searchProducts(filters: { searchTerm: $searchTerm }) {
          products(first: $first) {
            edges {
              node {
                entityId
                name
                sku
                brand
                prices {
                  price {
                    ...MoneyFieldFragment
                  }
                  salePrice {
                    ...MoneyFieldFragment
                  }
                }
                defaultImage {
                  url(width: 300)
                  altText
                }
                description
                inventoryLevel
                availabilityV2 {
                  status
                }
              }
            }
          }
        }
      }
    }
  }
`);

// Cached functions for server-side data fetching

export const getB2BCustomer = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { customer: null, error: 'No customer access token available' };
  }

  try {
    const response = await b2bClient.fetch({
      document: GetB2BCustomerQuery,
      variables: {},
      cache: 'no-store',
    });

    return { customer: response.data.customer, error: null };
  } catch (error) {
    console.error('Error fetching B2B customer:', error);
    return { 
      customer: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

export const getB2BOrders = cache(async (first: number = 50, after?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { orders: null, error: 'No customer access token available' };
  }

  try {
    const response = await b2bClient.fetch({
      document: GetB2BOrdersQuery,
      variables: { first, after },
      cache: 'no-store',
    });

    return { orders: response.data.customer.orders, error: null };
  } catch (error) {
    console.error('Error fetching B2B orders:', error);
    return { 
      orders: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

export const getB2BOrder = cache(async (orderId: number) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { order: null, error: 'No customer access token available' };
  }

  try {
    const response = await b2bClient.fetch({
      document: GetB2BOrderQuery,
      variables: { orderId },
      cache: 'no-store',
    });

    return { order: response.data.customer.order, error: null };
  } catch (error) {
    console.error('Error fetching B2B order:', error);
    return { 
      order: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

export const searchB2BProducts = cache(async (searchTerm: string, first: number = 20) => {
  try {
    const response = await b2bClient.fetch({
      document: SearchB2BProductsQuery,
      variables: { searchTerm, first },
      cache: 'no-store',
    });

    return { 
      products: response.data.site.search.searchProducts.products, 
      error: null 
    };
  } catch (error) {
    console.error('Error searching B2B products:', error);
    return { 
      products: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

// Export types for use in components
export type { 
  FragmentOf, 
  ResultOf, 
  VariablesOf 
} from '../graphql'; 