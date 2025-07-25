// B2B Shopping List Types
// Type definitions for B2B shopping list functionality

export interface LineItem {
  productId: number;
  quantity: number;
  selectedOptions?: Array<{
    optionId: number;
    value: string;
  }>;
}

export interface ShoppingList {
  id: number;
  customerId: number;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice?: number;
  options?: ShoppingListItemOption[];
  addedAt: string;
}

export interface ShoppingListItemOption {
  optionId: number;
  optionName: string;
  value: string;
  priceModifier?: number;
}

export interface ShoppingListSearchParams {
  customerId?: number;
  isDefault?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
} 