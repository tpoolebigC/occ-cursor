// B2B Shopping List Service
// Service functions for B2B shopping list management

import { B2BSDK } from '../types/sdk';
import { ShoppingList, ShoppingListItem, ShoppingListSearchParams } from '../types/shopping-list';

/**
 * Get shopping lists for a customer
 */
export async function getShoppingLists(
  sdk: B2BSDK,
  customerId: string,
  params?: ShoppingListSearchParams
): Promise<ShoppingList[]> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const lists = await sdk.utils.shoppingList.getLists(customerId, params);
    return lists;
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    throw error;
  }
}

/**
 * Get a specific shopping list by ID
 */
export async function getShoppingList(
  sdk: B2BSDK,
  listId: string
): Promise<ShoppingList> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const list = await sdk.utils.shoppingList.getList(listId);
    return list;
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw error;
  }
}

/**
 * Create a new shopping list
 */
export async function createShoppingList(
  sdk: B2BSDK,
  customerId: string,
  listData: Partial<ShoppingList>
): Promise<ShoppingList> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const list = await sdk.utils.shoppingList.createList(customerId, listData);
    return list;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
}

/**
 * Update a shopping list
 */
export async function updateShoppingList(
  sdk: B2BSDK,
  listId: string,
  listData: Partial<ShoppingList>
): Promise<ShoppingList> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const list = await sdk.utils.shoppingList.updateList(listId, listData);
    return list;
  } catch (error) {
    console.error('Error updating shopping list:', error);
    throw error;
  }
}

/**
 * Add items to a shopping list
 */
export async function addShoppingListItems(
  sdk: B2BSDK,
  listId: string,
  items: ShoppingListItem[]
): Promise<ShoppingList> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const list = await sdk.utils.shoppingList.addItems(listId, items);
    return list;
  } catch (error) {
    console.error('Error adding shopping list items:', error);
    throw error;
  }
}

/**
 * Remove items from a shopping list
 */
export async function removeShoppingListItems(
  sdk: B2BSDK,
  listId: string,
  itemIds: string[]
): Promise<ShoppingList> {
  try {
    if (!sdk.utils?.shoppingList) {
      throw new Error('Shopping list service not available in B2B SDK');
    }
    const list = await sdk.utils.shoppingList.removeItems(listId, itemIds);
    return list;
  } catch (error) {
    console.error('Error removing shopping list items:', error);
    throw error;
  }
} 