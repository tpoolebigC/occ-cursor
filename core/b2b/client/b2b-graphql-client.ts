/**
 * B2B GraphQL Client using gql-tada
 * 
 * This client provides type-safe B2B operations using gql-tada and follows
 * Catalyst's architecture patterns for server actions and client components.
 */

import { client } from '~/client';
import { graphql, type ResultOf } from '~/client/graphql';
import { auth } from '~/auth';

// ============================================================================
// CUSTOMER QUERIES
// ============================================================================

export const GET_CUSTOMER_INFO = graphql(`
  query GetCustomerInfo {
    customer {
      entityId
      email
      firstName
      lastName
      company
      customerGroupId
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

// ============================================================================
// ORDER QUERIES
// ============================================================================

export const GET_ORDERS = graphql(`
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

export const GET_ORDER_DETAIL = graphql(`
  query GetOrderDetail($orderId: Int!) {
    customer {
      orders(first: 1, filters: { entityId: [$orderId] }) {
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

// ============================================================================
// PRODUCT SEARCH QUERIES
// ============================================================================

export const SEARCH_PRODUCTS = graphql(`
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
                brand {
                  name
                }
                availabilityV2 {
                  status
                  description
                }
              }
            }
          }
        }
      }
    }
  }
`);

// ============================================================================
// CART QUERIES
// ============================================================================

export const GET_CART = graphql(`
  query GetCart {
    site {
      cart {
        entityId
        currencyCode
        isTaxIncluded
        lineItems {
          physicalItems {
            entityId
            productEntityId
            name
            quantity
            selectedOptions {
              entityId
              name
            }
            imageUrl
            prices {
              price {
                value
                currencyCode
              }
            }
          }
          digitalItems {
            entityId
            productEntityId
            name
            quantity
            selectedOptions {
              entityId
              name
            }
            imageUrl
            prices {
              price {
                value
                currencyCode
              }
            }
          }
        }
        cartAmount {
          value
          currencyCode
        }
      }
    }
  }
`);

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

export async function getCustomerInfo() {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_CUSTOMER_INFO,
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer;
}

export async function getOrders(first: number = 10, after?: string) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_ORDERS,
    variables: { first, after },
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.orders;
}

export async function getOrderDetail(orderId: number) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_ORDER_DETAIL,
    variables: { orderId },
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.orders?.edges?.[0]?.node;
}

export async function searchProducts(searchTerm: string, first: number = 10) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: SEARCH_PRODUCTS,
    variables: { searchTerm, first },
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.site?.search?.searchProducts?.products;
}

export async function getCart() {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_CART,
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.site?.cart;
}

// ============================================================================
// TYPES
// ============================================================================

export type CustomerInfo = ResultOf<typeof GET_CUSTOMER_INFO>['customer'];
export type OrdersResponse = NonNullable<ResultOf<typeof GET_ORDERS>['customer']>['orders'];
export type OrderDetail = any; // Simplified for now - will be properly typed when GraphQL schema is finalized
export type SearchProductsResponse = ResultOf<typeof SEARCH_PRODUCTS>['site']['search']['searchProducts']['products'];
export type CartResponse = ResultOf<typeof GET_CART>['site']['cart']; 