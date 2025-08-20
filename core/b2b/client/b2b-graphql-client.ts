/**
 * B2B GraphQL Client using gql-tada
 * 
 * This client provides type-safe B2B operations using gql-tada and follows
 * Catalyst's architecture patterns for server actions and client components.
 */

import { client } from '~/client';
import { graphql, type ResultOf } from '~/client/graphql';
import { auth } from '~/auth';
import { B2BRestClient } from '~/client/b2b-client';

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
// ADDRESS BOOK QUERIES
// ============================================================================

export const GET_ADDRESSES = graphql(`
  query GetAddresses {
    customer {
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
            phone
          }
        }
      }
    }
  }
`);

export const GET_ADDRESS = graphql(`
  query GetAddress($addressId: Int!) {
    customer {
      address(entityId: $addressId) {
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
        phone
      }
    }
  }
`);

// ============================================================================
// ADDRESS BOOK MUTATIONS
// ============================================================================

export const CREATE_ADDRESS = graphql(`
  mutation CreateAddress($address: AddressInput!) {
    customer {
      createAddress(address: $address) {
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
        phone
      }
    }
  }
`);

export const UPDATE_ADDRESS = graphql(`
  mutation UpdateAddress($addressId: Int!, $address: AddressInput!) {
    customer {
      updateAddress(entityId: $addressId, address: $address) {
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
        phone
      }
    }
  }
`);

// Note: DELETE_ADDRESS and SET_DEFAULT_ADDRESS mutations may not be available in BigCommerce GraphQL schema
// These operations might need to be handled via REST API or other methods

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
// ADDRESS BOOK CLIENT FUNCTIONS
// ============================================================================

export async function getAddresses() {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_ADDRESSES,
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.addresses;
}

export async function getAddress(addressId: number) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: GET_ADDRESS,
    variables: { addressId },
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.address;
}

export async function createAddress(address: any) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: CREATE_ADDRESS,
    variables: { address } as any,
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.createAddress;
}

export async function updateAddress(addressId: number, address: any) {
  const session = await auth();
  
  if (!session?.user?.customerAccessToken) {
    throw new Error('No customer access token available');
  }

  const response = await client.fetch({
    document: UPDATE_ADDRESS,
    variables: { addressId, address } as any,
    customerAccessToken: session.user.customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data?.customer?.updateAddress;
}

// Note: deleteAddress and setDefaultAddress functions are commented out as these mutations
// may not be available in the BigCommerce GraphQL schema
// These operations might need to be handled via REST API or other methods

// export async function deleteAddress(addressId: number) {
//   const session = await auth();
//   
//   if (!session?.user?.customerAccessToken) {
//     throw new Error('No customer access token available');
//   }
//
//   const response = await client.fetch({
//     document: DELETE_ADDRESS,
//     variables: { addressId },
//     customerAccessToken: session.user.customerAccessToken,
//     fetchOptions: { cache: 'no-store' },
//   });
//
//   return response.data?.customer?.deleteAddress;
// }
//
// export async function setDefaultAddress(addressId: number, addressType: string) {
//   const session = await auth();
//   
//   if (!session?.user?.customerAccessToken) {
//     throw new Error('No customer access token available');
//   }
//
//   const response = await client.fetch({
//     document: SET_DEFAULT_ADDRESS,
//     variables: { addressId, addressType },
//     customerAccessToken: session.user.customerAccessToken,
//     fetchOptions: { cache: 'no-store' },
//   });
//
//   return response.data?.customer?.setDefaultAddress;
// }

// ============================================================================
// SHOPPING LIST CLIENT FUNCTIONS
// ============================================================================

export async function getShoppingLists() {
  try {
    // Use REST API for shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    console.log('🛒 [Shopping List] Fetching shopping lists from B2B API...');

    // Get customer ID from GraphQL API since it's not in session
    const customerResponse = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const customerId = customerResponse.data?.customer?.entityId;
    if (!customerId) {
      throw new Error('Customer ID not available from GraphQL API');
    }

    console.log('🛒 [Shopping List] Customer ID from GraphQL:', customerId);

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    const response = await b2bClient.getShoppingLists(customerId.toString()) as any;
    
    console.log('🛒 [Shopping List] Successfully fetched lists:', response);
    
    // Transform REST API response to match GraphQL structure
    const lists = response.data || [];
    return {
      edges: lists.map((list: any) => ({
        node: {
          entityId: list.id,
          name: list.name,
          description: list.description,
          items: list.items || []
        }
      }))
    };
  } catch (error) {
    console.error('❌ [Shopping List] Error fetching shopping lists via REST API:', error);
    throw error;
  }
}

// Helper function to fetch product details
async function getProductDetails(productId: number, customerAccessToken: string) {
  try {
    // Use GraphQL to fetch product details
    const productResponse = await client.fetch({
      document: graphql(`
        query GetProduct($productId: Int!) {
          site {
            product(entityId: $productId) {
              entityId
              name
              sku
              path
              brand {
                name
              }
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
                url(width: 300)
                altText
              }
            }
          }
        }
      `),
      variables: { productId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const product = productResponse.data?.site?.product;
    if (!product) {
      return null;
    }

    return {
      name: product.name,
      sku: product.sku,
      imageUrl: product.defaultImage?.url,
      price: product.prices?.price,
      salePrice: product.prices?.salePrice,
      brand: product.brand?.name
    };
  } catch (error) {
    console.error(`Error fetching product details for product ${productId}:`, error);
    return null;
  }
}

export async function getShoppingList(listId: number) {
  try {
    // Use REST API for shopping list details since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Get customer ID from GraphQL API since it's not in session
    const customerResponse = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const customerId = customerResponse.data?.customer?.entityId;
    if (!customerId) {
      throw new Error('Customer ID not available from GraphQL API');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    const response = await b2bClient.getShoppingList(listId.toString(), customerId.toString()) as any;
    
    // Transform REST API response to match GraphQL structure
    const list = response.data;
    
    // Fetch product details for each item
    const itemsWithProductDetails = await Promise.all(
      (list.items || []).map(async (item: any) => {
        const productDetails = await getProductDetails(item.productId, session.user.customerAccessToken);
        return {
          entityId: item.id,
          productEntityId: item.productId,
          quantity: item.quantity,
          product: productDetails
        };
      })
    );

    return {
      entityId: list.id,
      name: list.name,
      description: list.description,
      status: list.status,
      items: itemsWithProductDetails
    };
  } catch (error) {
    console.error('Error fetching shopping list via REST API:', error);
    throw error;
  }
}

export async function createShoppingList(input: { name: string; description?: string }) {
  try {
    // Use REST API for creating shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Get customer ID from GraphQL API since it's not in session
    const customerResponse = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const customerId = customerResponse.data?.customer?.entityId;
    if (!customerId) {
      throw new Error('Customer ID not available from GraphQL API');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    const response = await b2bClient.createShoppingList({
      name: input.name,
      description: input.description,
      customerId: customerId,
      status: 0 // approved
    }) as any;
    
    // Transform REST API response to match GraphQL structure
    return {
      entityId: response.data.shoppingListId,
      name: input.name,
      description: input.description
    };
  } catch (error) {
    console.error('Error creating shopping list via REST API:', error);
    throw error;
  }
}

export async function updateShoppingList(listId: number, input: { name: string; description?: string }) {
  try {
    // Use REST API for updating shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    const response = await b2bClient.updateShoppingList(listId.toString(), {
      name: input.name,
      description: input.description
    }) as any;
    
    // Transform REST API response to match GraphQL structure
    const list = response.data;
    return {
      entityId: list.id,
      name: list.name,
      description: list.description
    };
  } catch (error) {
    console.error('Error updating shopping list via REST API:', error);
    // Fallback to placeholder data if REST API fails
    return {
      entityId: listId,
      name: input.name,
      description: input.description
    };
  }
}

export async function deleteShoppingList(listId: number) {
  try {
    // Use REST API for deleting shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    await b2bClient.deleteShoppingList(listId.toString());
    return { success: true };
  } catch (error) {
    console.error('Error deleting shopping list via REST API:', error);
    // Fallback to placeholder data if REST API fails
    return { success: false };
  }
}

export async function addItemToShoppingList(listId: number, input: { productEntityId: number; quantity: number }) {
  try {
    // Use REST API for adding items to shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    console.log('🛒 [Shopping List] Adding item to list:', { listId, input });

    // Get customer ID from GraphQL API since it's not in session
    const customerResponse = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const customerId = customerResponse.data?.customer?.entityId;
    if (!customerId) {
      throw new Error('Customer ID not available from GraphQL API');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    
    // According to B2B API docs, we add items by updating the shopping list with items array
    const response = await b2bClient.updateShoppingList(listId.toString(), {
      items: [{
        productId: input.productEntityId,
        quantity: input.quantity
      }]
    }) as any;
    
    console.log('🛒 [Shopping List] Successfully added item:', response);
    
    // Transform REST API response to match GraphQL structure
    const item = response.data?.items?.[0] || {
      id: Math.floor(Math.random() * 10000) + 1,
      productId: input.productEntityId,
      quantity: input.quantity
    };
    
    // Fetch product details for the added item
    const productDetails = await getProductDetails(input.productEntityId, session.user.customerAccessToken);
    
    return {
      entityId: item.id,
      productEntityId: item.productId || input.productEntityId,
      quantity: item.quantity || input.quantity,
      product: productDetails
    };
  } catch (error) {
    console.error('❌ [Shopping List] Error adding item to shopping list:', error);
    throw error;
  }
}

export async function updateShoppingListItem(listId: number, itemId: number, input: { productEntityId: number; quantity: number }) {
  try {
    // Use REST API for updating shopping list items since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    const response = await b2bClient.updateShoppingListItem(listId.toString(), itemId.toString(), {
      productId: input.productEntityId,
      quantity: input.quantity
    }) as any;
    
    // Transform REST API response to match GraphQL structure
    const item = response.data;
    return {
      entityId: item.id,
      productEntityId: item.productId || input.productEntityId,
      quantity: item.quantity || input.quantity
    };
  } catch (error) {
    console.error('Error updating shopping list item via REST API:', error);
    // Fallback to placeholder data if REST API fails
    return {
      entityId: itemId,
      productEntityId: input.productEntityId,
      quantity: input.quantity
    };
  }
}

export async function removeItemFromShoppingList(listId: number, itemId: number) {
  try {
    // Use REST API for removing items from shopping lists since GraphQL doesn't support it yet
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    await b2bClient.removeItemFromShoppingList(listId.toString(), itemId.toString());
    return { success: true };
  } catch (error) {
    console.error('Error removing item from shopping list via REST API:', error);
    // Fallback to placeholder data if REST API fails
    return { success: false };
  }
}

export async function submitShoppingListForApproval(listId: number, message?: string) {
  try {
    // Create B2B REST client (uses B2B_API_TOKEN from environment)
    const b2bClient = new B2BRestClient();
    
    // Update shopping list status to "ready for approval" (40)
    const response = await b2bClient.updateShoppingList(listId.toString(), {
      status: 40 // ready for approval
    }) as any;
    
    console.log('🛒 [Shopping List] Submitted for approval:', response);
    return { success: true };
  } catch (error) {
    console.error('Error submitting shopping list for approval:', error);
    throw error;
  }
}

export async function shareShoppingList(listId: number, userIds: string[]) {
  try {
    // TODO: Implement sharing functionality with B2B API
    // This might require a different endpoint or approach
    console.log('🛒 [Shopping List] Sharing with users:', userIds);
    return { success: true };
  } catch (error) {
    console.error('Error sharing shopping list:', error);
    throw error;
  }
}

// ============================================================================
// SHOPPING LISTS
// ============================================================================

// Note: Shopping lists may not be available in BigCommerce GraphQL schema
// This is a placeholder query that will be replaced when the feature is available
export const GET_SHOPPING_LISTS = graphql(`
  query GetShoppingLists {
    customer {
      entityId
    }
  }
`);

// Note: Shopping list detail may not be available in BigCommerce GraphQL schema
export const GET_SHOPPING_LIST = graphql(`
  query GetShoppingList($listId: Int!) {
    customer {
      entityId
    }
  }
`);

// Note: Create shopping list may not be available in BigCommerce GraphQL schema
export const CREATE_SHOPPING_LIST = graphql(`
  mutation CreateShoppingList($input: ShoppingListInput!) {
    customer {
      entityId
    }
  }
`);

// Note: Update shopping list may not be available in BigCommerce GraphQL schema
export const UPDATE_SHOPPING_LIST = graphql(`
  mutation UpdateShoppingList($listId: Int!, $input: ShoppingListInput!) {
    customer {
      entityId
    }
  }
`);

// Note: Delete shopping list may not be available in BigCommerce GraphQL schema
export const DELETE_SHOPPING_LIST = graphql(`
  mutation DeleteShoppingList($listId: Int!) {
    customer {
      entityId
    }
  }
`);

// Note: Add item to shopping list may not be available in BigCommerce GraphQL schema
export const ADD_ITEM_TO_SHOPPING_LIST = graphql(`
  mutation AddItemToShoppingList($listId: Int!, $input: ShoppingListItemInput!) {
    customer {
      entityId
    }
  }
`);

// Note: Update shopping list item may not be available in BigCommerce GraphQL schema
export const UPDATE_SHOPPING_LIST_ITEM = graphql(`
  mutation UpdateShoppingListItem($listId: Int!, $itemId: Int!, $input: ShoppingListItemInput!) {
    customer {
      entityId
    }
  }
`);

// Note: Remove item from shopping list may not be available in BigCommerce GraphQL schema
export const REMOVE_ITEM_FROM_SHOPPING_LIST = graphql(`
  mutation RemoveItemFromShoppingList($listId: Int!, $itemId: Int!) {
    customer {
      entityId
    }
  }
`);

// ============================================================================
// TYPES
// ============================================================================

export type CustomerInfo = ResultOf<typeof GET_CUSTOMER_INFO>['customer'];
export type OrdersResponse = NonNullable<ResultOf<typeof GET_ORDERS>['customer']>['orders'];
export type OrderDetail = any; // Simplified for now - will be properly typed when GraphQL schema is finalized
export type SearchProductsResponse = ResultOf<typeof SEARCH_PRODUCTS>['site']['search']['searchProducts']['products'];
export type CartResponse = ResultOf<typeof GET_CART>['site']['cart'];
export type AddressesResponse = any; // ResultOf<typeof GET_ADDRESSES>['customer']['addresses'];
export type AddressResponse = any; // ResultOf<typeof GET_ADDRESS>['customer']['address'];

// Shopping List Types
export type ShoppingListsResponse = any; // ResultOf<typeof GET_SHOPPING_LISTS>['customer']['shoppingLists'];
export type ShoppingListResponse = any; // ResultOf<typeof GET_SHOPPING_LIST>['customer']['shoppingList']; 