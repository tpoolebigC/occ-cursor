// Makeswift Search Products Utility
// Utility functions for searching products in Makeswift components

import { getProductsByIds } from '~/client/queries/get-products';

interface SearchProduct {
  entityId: number;
  name: string;
  path: string;
}

export async function searchProducts(query: string, limit: number = 10): Promise<SearchProduct[]> {
  try {
    // For now, return empty array since we don't have a search function
    // This would need to be implemented with a proper search API
    console.warn('Search products function not fully implemented');
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
} 