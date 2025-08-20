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
  getAddresses as getAddressesClient,
  getAddress as getAddressClient,
  createAddress as createAddressClient,
  updateAddress as updateAddressClient,
  getShoppingLists as getShoppingListsClient,
  getShoppingList as getShoppingListClient,
  createShoppingList as createShoppingListClient,
  updateShoppingList as updateShoppingListClient,
  deleteShoppingList as deleteShoppingListClient,
  addItemToShoppingList as addItemToShoppingListClient,
  updateShoppingListItem as updateShoppingListItemClient,
  removeItemFromShoppingList as removeItemFromShoppingListClient,
  type CustomerInfo,
  type OrdersResponse,
  type OrderDetail,
  type SearchProductsResponse,
  type CartResponse,
  type AddressesResponse,
  type AddressResponse,
  type ShoppingListsResponse,
  type ShoppingListResponse
} from './client/b2b-graphql-client';

// Import the real B2B REST client
import { b2bRestClient } from '~/client/b2b-client';

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
    const data = await b2bRestClient.getQuotes();
    const quotes = (data as any)?.data ?? [];
    return {
      quotes: {
        edges: quotes.map((q: any) => ({
          node: {
            entityId: q.id,
            name: q.name,
            status: q.status,
            createdAt: { utc: q.createdAt },
            totalIncTax: { value: q.total?.amount ?? 0 },
          },
        })),
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { quotes: { edges: [] }, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getQuote(quoteId: number) {
  try {
    const data = await b2bRestClient.getQuote(String(quoteId));
    return { quote: (data as any)?.data, error: null };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return { quote: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createQuote(input: any) {
  try {
    const data = await b2bRestClient.createQuote(input);
    revalidatePath('/buyer-portal/quotes');
    return { quote: (data as any)?.data, error: null };
  } catch (error) {
    console.error('Error creating quote:', error);
    return { quote: null, error: error instanceof Error ? error.message : 'Unknown error' };
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

// ============================================================================
// ADDRESS BOOK SERVER ACTIONS
// ============================================================================

export async function getAddresses() {
  try {
    const addresses = await getAddressesClient();
    return { addresses, error: null };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return { addresses: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAddress(addressId: number) {
  try {
    const address = await getAddressClient(addressId);
    return { address, error: null };
  } catch (error) {
    console.error('Error fetching address:', error);
    return { address: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createAddress(addressData: any) {
  try {
    const address = await createAddressClient(addressData);
    revalidatePath('/custom-dashboard/addresses');
    return { address, error: null };
  } catch (error) {
    console.error('Error creating address:', error);
    return { address: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateAddress(addressId: number, addressData: any) {
  try {
    const address = await updateAddressClient(addressId, addressData);
    revalidatePath('/custom-dashboard/addresses');
    return { address, error: null };
  } catch (error) {
    console.error('Error updating address:', error);
    return { address: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteAddress(addressId: number) {
  try {
    await b2bRestClient.deleteAddress(String(addressId));
    revalidatePath('/custom-dashboard/addresses');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function setDefaultAddress(addressId: number, addressType: string) {
  try {
    // Placeholder: Implement when endpoint confirmed in B2B API
    return { success: false, error: 'Set default address not available via current API' };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// SHOPPING LIST SERVER ACTIONS
// ============================================================================

export async function getShoppingLists() {
  try {
    const shoppingLists = await getShoppingListsClient();
    return { shoppingLists, error: null };
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return { shoppingLists: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getShoppingList(listId: number) {
  try {
    const shoppingList = await getShoppingListClient(listId);
    return { shoppingList, error: null };
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createShoppingList(input: { name: string; description?: string }) {
  try {
    const result = await createShoppingListClient(input);
    revalidatePath('/custom-dashboard/shopping-lists');
    return { shoppingList: result, error: null };
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateShoppingList(listId: number, input: { name: string; description?: string }) {
  try {
    const result = await updateShoppingListClient(listId, input);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${listId}`);
    return { shoppingList: result, error: null };
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteShoppingList(listId: number) {
  try {
    const result = await deleteShoppingListClient(listId);
    revalidatePath('/custom-dashboard/shopping-lists');
    return { success: (result as any)?.success || false, error: null };
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addItemToShoppingList(listId: number, input: { productEntityId: number; quantity: number }) {
  try {
    const result = await addItemToShoppingListClient(listId, input);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${listId}`);
    return { item: result, error: null };
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    return { item: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateShoppingListItem(listId: number, itemId: number, input: { productEntityId: number; quantity: number }) {
  try {
    const result = await updateShoppingListItemClient(listId, itemId, input);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${listId}`);
    return { item: result, error: null };
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return { item: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeItemFromShoppingList(listId: number, itemId: number) {
  try {
    const result = await removeItemFromShoppingListClient(listId, itemId);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${listId}`);
    return { success: (result as any)?.success || false, error: null };
  } catch (error) {
    console.error('Error removing item from shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function submitShoppingListForApproval(listId: number, message?: string) {
  try {
    // TODO: Implement with B2B API
    console.log('Submitting shopping list for approval:', { listId, message });
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${listId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error submitting shopping list for approval:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function shareShoppingList(listId: number, userIds: string[]) {
  try {
    // TODO: Implement with B2B API
    console.log('Sharing shopping list:', { listId, userIds });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sharing shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// USER MANAGEMENT SERVER ACTIONS (Catalyst-based)
// ============================================================================

export async function getUsers(filters: any = {}) {
  try {
    const { getCompanyUsers } = await import('./client/user-management-client');
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { users: [], error: 'No customer access token available' };
    }

    // For now, we'll use mock data since the GraphQL schema might not support company users yet
    const mockUsers = [
      {
        id: 1,
        email: 'john.smith@company.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 1, // ADMIN
        status: 'active',
        companyId: 1,
        companyName: 'Acme Corp',
        phone: '+1-555-0123',
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2023-06-01T00:00:00Z',
        permissions: ['orders', 'quotes', 'shopping_lists', 'user_management']
      },
      {
        id: 2,
        email: 'jane.doe@company.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 2, // SENIOR_BUYER
        status: 'active',
        companyId: 1,
        companyName: 'Acme Corp',
        phone: '+1-555-0124',
        lastLogin: '2024-01-14T15:45:00Z',
        createdAt: '2023-08-15T00:00:00Z',
        permissions: ['orders', 'quotes', 'shopping_lists']
      }
    ];

    return { users: mockUsers, error: null };
  } catch (error) {
    console.error('Error getting users:', error);
    return { users: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getUser(userId: number) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { user: null, error: 'No customer access token available' };
    }

    // Mock user data for now
    const mockUser = {
      id: userId,
      email: 'john.smith@company.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 1, // ADMIN
      status: 'active',
      companyId: 1,
      companyName: 'Acme Corp',
      phone: '+1-555-0123',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      permissions: ['orders', 'quotes', 'shopping_lists', 'user_management']
    };

    return { user: mockUser, error: null };
  } catch (error) {
    console.error('Error getting user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createUser(input: any) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { user: null, error: 'No customer access token available' };
    }

    // Mock creation for now
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...input,
      status: 'pending',
      companyId: 1,
      companyName: 'Acme Corp',
      createdAt: new Date().toISOString(),
      permissions: []
    };

    revalidatePath('/custom-dashboard/users');
    return { user: newUser, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUser(userId: number, input: any) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { user: null, error: 'No customer access token available' };
    }

    // Mock update for now
    const updatedUser = {
      id: userId,
      email: 'john.smith@company.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 1,
      status: 'active',
      companyId: 1,
      companyName: 'Acme Corp',
      phone: '+1-555-0123',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      permissions: ['orders', 'quotes', 'shopping_lists', 'user_management'],
      ...input
    };

    revalidatePath('/custom-dashboard/users');
    revalidatePath(`/custom-dashboard/users/${userId}`);
    return { user: updatedUser, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteUser(userId: number) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { success: false, error: 'No customer access token available' };
    }

    // Mock deletion for now
    console.log('Deleting user:', userId);

    revalidatePath('/custom-dashboard/users');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function inviteUserToCompany(input: any) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { user: null, error: 'No customer access token available' };
    }

    // Mock invitation for now
    const invitedUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...input,
      status: 'pending',
      companyId: input.companyId || 1,
      companyName: 'Acme Corp',
      createdAt: new Date().toISOString(),
      permissions: []
    };

    revalidatePath('/custom-dashboard/users');
    return { user: invitedUser, error: null };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function resendInvitation(userId: number) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { success: false, error: 'No customer access token available' };
    }

    // Mock resend for now
    console.log('Resending invitation to user:', userId);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUserStatus(userId: number, status: 'active' | 'inactive') {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { user: null, error: 'No customer access token available' };
    }

    // Mock status update for now
    const updatedUser = {
      id: userId,
      email: 'john.smith@company.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 1,
      status,
      companyId: 1,
      companyName: 'Acme Corp',
      phone: '+1-555-0123',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      permissions: ['orders', 'quotes', 'shopping_lists', 'user_management']
    };

    revalidatePath('/custom-dashboard/users');
    revalidatePath(`/custom-dashboard/users/${userId}`);
    return { user: updatedUser, error: null };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getUserPermissions(userId: number) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { permissions: [], error: 'No customer access token available' };
    }

    // Mock permissions for now
    const permissions = ['orders', 'quotes', 'shopping_lists', 'user_management'];

    return { permissions, error: null };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { permissions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUserPermissions(userId: number, permissions: string[]) {
  try {
    const { getSessionCustomerAccessToken } = await import('~/auth');
    
    const customerAccessToken = await getSessionCustomerAccessToken();
    if (!customerAccessToken) {
      return { permissions: [], error: 'No customer access token available' };
    }

    // Mock permission update for now
    console.log('Updating permissions for user:', userId, permissions);

    revalidatePath('/custom-dashboard/users');
    revalidatePath(`/custom-dashboard/users/${userId}`);
    return { permissions, error: null };
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return { permissions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 