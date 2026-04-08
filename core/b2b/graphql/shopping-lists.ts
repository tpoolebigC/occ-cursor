/**
 * B2B GraphQL - Shopping List Queries and Mutations
 *
 * Full CRUD with Duplicate support. Includes both B2B (company) and
 * B2C (customer) variants for all operations.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BShoppingListItemOption {
  optionId: number;
  optionValue: string;
}

export interface B2BShoppingListItem {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  productName: string;
  sku?: string;
  imageUrl?: string;
  basePrice: string;
  options: B2BShoppingListItemOption[];
}

export interface B2BShoppingList {
  id: number;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  customerInfo: { firstName: string; lastName: string; email: string };
  products: {
    totalCount: number;
    edges: Array<{ node: B2BShoppingListItem }>;
  };
}

export interface B2BShoppingListEdge {
  node: B2BShoppingList;
}

export interface B2BShoppingListsConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BShoppingListEdge[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const SHOPPING_LIST_FIELDS = `
  id
  name
  description
  status
  createdAt
  products(first: 1, offset: 0) {
    totalCount
  }
  updatedAt
  customerInfo {
    firstName
    lastName
    email
  }
`;

const SHOPPING_LIST_WITH_ITEMS_FIELDS = `
  ${SHOPPING_LIST_FIELDS}
  products(first: $itemsFirst, offset: $itemsOffset) {
    totalCount
    edges {
      node {
        id
        productId
        variantId
        quantity
        productName
        basePrice
        optionList
      }
    }
  }
`;

const SHOPPING_LISTS_QUERY = `
  query ShoppingLists(
    $first: Int = 25
    $offset: Int = 0
    $search: String
  ) {
    shoppingLists(first: $first, offset: $offset, search: $search) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${SHOPPING_LIST_FIELDS}
        }
      }
    }
  }
`;

const SHOPPING_LIST_DETAIL_QUERY = `
  query ShoppingListDetail(
    $shoppingListId: Int!
    $itemsFirst: Int = 50
    $itemsOffset: Int = 0
  ) {
    shoppingList(id: $shoppingListId) {
      ${SHOPPING_LIST_WITH_ITEMS_FIELDS}
    }
  }
`;

const CUSTOMER_SHOPPING_LISTS_QUERY = `
  query CustomerShoppingLists(
    $first: Int = 25
    $offset: Int = 0
    $search: String
  ) {
    customerShoppingLists(first: $first, offset: $offset, search: $search) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${SHOPPING_LIST_FIELDS}
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const SHOPPING_LIST_CREATE_MUTATION = `
  mutation ShoppingListCreate($shoppingListData: ShoppingListsInputType!) {
    shoppingListsCreate(shoppingListData: $shoppingListData) {
      shoppingList {
        ${SHOPPING_LIST_FIELDS}
      }
    }
  }
`;

const SHOPPING_LIST_UPDATE_MUTATION = `
  mutation ShoppingListUpdate($id: Int!, $shoppingListData: ShoppingListsInputType!) {
    shoppingListsUpdate(id: $id, shoppingListData: $shoppingListData) {
      shoppingList {
        ${SHOPPING_LIST_FIELDS}
      }
    }
  }
`;

const SHOPPING_LIST_DELETE_MUTATION = `
  mutation ShoppingListDelete($id: Int!) {
    shoppingListsDelete(id: $id) {
      message
    }
  }
`;

const SHOPPING_LIST_DUPLICATE_MUTATION = `
  mutation ShoppingListDuplicate($shoppingListData: ShoppingListsDuplicateInputType!) {
    shoppingListsDuplicate(shoppingListData: $shoppingListData) {
      shoppingList {
        ${SHOPPING_LIST_FIELDS}
      }
    }
  }
`;

const SHOPPING_LIST_ITEMS_CREATE_MUTATION = `
  mutation ShoppingListItemsCreate($shoppingListId: Int!, $items: [ShoppingListsItemsInputType]!) {
    shoppingListsItemsCreate(shoppingListId: $shoppingListId, items: $items) {
      shoppingListsItems {
        id
        productId
        variantId
        quantity
      }
    }
  }
`;

const SHOPPING_LIST_ITEMS_UPDATE_MUTATION = `
  mutation ShoppingListItemsUpdate($shoppingListId: Int!, $items: [ShoppingListsItemsUpdateInputType]!) {
    shoppingListsItemsUpdate(shoppingListId: $shoppingListId, items: $items) {
      shoppingListsItems {
        id
        productId
        variantId
        quantity
      }
    }
  }
`;

const SHOPPING_LIST_ITEMS_DELETE_MUTATION = `
  mutation ShoppingListItemsDelete($shoppingListId: Int!, $itemIds: [Int]!) {
    shoppingListsItemsDelete(shoppingListId: $shoppingListId, itemIds: $itemIds) {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export interface ShoppingListParams {
  first?: number;
  offset?: number;
  search?: string;
}

export async function getShoppingLists(params: ShoppingListParams = {}) {
  const data = await b2bGraphQL<{ shoppingLists: B2BShoppingListsConnection }>(
    SHOPPING_LISTS_QUERY,
    {
      first: params.first ?? 25,
      offset: params.offset ?? 0,
      search: params.search,
    },
  );
  return data.shoppingLists;
}

export async function getShoppingListDetail(
  shoppingListId: number,
  itemsFirst = 50,
  itemsOffset = 0,
) {
  const data = await b2bGraphQL<{ shoppingList: B2BShoppingList }>(
    SHOPPING_LIST_DETAIL_QUERY,
    { shoppingListId, itemsFirst, itemsOffset },
  );
  return data.shoppingList;
}

export async function getCustomerShoppingLists(params: ShoppingListParams = {}) {
  const data = await b2bGraphQL<{ customerShoppingLists: B2BShoppingListsConnection }>(
    CUSTOMER_SHOPPING_LISTS_QUERY,
    {
      first: params.first ?? 25,
      offset: params.offset ?? 0,
      search: params.search,
    },
  );
  return data.customerShoppingLists;
}

export async function createShoppingList(input: {
  name: string;
  description?: string;
  status?: number;
}) {
  const data = await b2bGraphQL<{
    shoppingListsCreate: { shoppingList: B2BShoppingList };
  }>(SHOPPING_LIST_CREATE_MUTATION, {
    shoppingListData: { name: input.name, description: input.description ?? '', status: input.status ?? 0 },
  });
  return data.shoppingListsCreate.shoppingList;
}

export async function updateShoppingList(
  id: number,
  input: { name?: string; description?: string; status?: number },
) {
  const data = await b2bGraphQL<{
    shoppingListsUpdate: { shoppingList: B2BShoppingList };
  }>(SHOPPING_LIST_UPDATE_MUTATION, { id, shoppingListData: input });
  return data.shoppingListsUpdate.shoppingList;
}

export async function deleteShoppingList(id: number) {
  const data = await b2bGraphQL<{ shoppingListsDelete: { message: string } }>(
    SHOPPING_LIST_DELETE_MUTATION,
    { id },
  );
  return data.shoppingListsDelete.message;
}

export async function duplicateShoppingList(input: {
  sourceShoppingListId: number;
  name: string;
  description?: string;
}) {
  const data = await b2bGraphQL<{
    shoppingListsDuplicate: { shoppingList: B2BShoppingList };
  }>(SHOPPING_LIST_DUPLICATE_MUTATION, { shoppingListData: input });
  return data.shoppingListsDuplicate.shoppingList;
}

export async function addItemsToShoppingList(
  shoppingListId: number,
  items: Array<{
    productId: number;
    variantId?: number;
    quantity: number;
    options?: Array<{ optionId: number; optionValue: string }>;
  }>,
) {
  const data = await b2bGraphQL<{
    shoppingListsItemsCreate: {
      shoppingListsItems: Array<{ id: number; productId: number; variantId: number; quantity: number }>;
    };
  }>(SHOPPING_LIST_ITEMS_CREATE_MUTATION, { shoppingListId, items });
  return data.shoppingListsItemsCreate.shoppingListsItems;
}

export async function updateShoppingListItems(
  shoppingListId: number,
  items: Array<{ id: number; quantity: number }>,
) {
  const data = await b2bGraphQL<{
    shoppingListsItemsUpdate: {
      shoppingListsItems: Array<{ id: number; productId: number; variantId: number; quantity: number }>;
    };
  }>(SHOPPING_LIST_ITEMS_UPDATE_MUTATION, { shoppingListId, items });
  return data.shoppingListsItemsUpdate.shoppingListsItems;
}

export async function deleteShoppingListItems(shoppingListId: number, itemIds: number[]) {
  const data = await b2bGraphQL<{ shoppingListsItemsDelete: { message: string } }>(
    SHOPPING_LIST_ITEMS_DELETE_MUTATION,
    { shoppingListId, itemIds },
  );
  return data.shoppingListsItemsDelete.message;
}
