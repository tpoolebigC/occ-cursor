'use server';

/**
 * Server actions for unified search across the buyer portal.
 * Uses the configured SearchProvider (Algolia, BigCommerce, etc.)
 * and applies company catalog filtering when applicable.
 */

import type {
  SearchRequest,
  SearchResponse,
  SearchProduct,
  SearchSuggestion,
  CompanySearchContext,
} from './types';
import { getSearchProvider } from './provider-factory';

/**
 * Perform a product search using the configured provider.
 * Optionally applies company catalog filtering.
 */
export async function searchProducts(
  request: SearchRequest,
): Promise<SearchResponse> {
  const provider = await getSearchProvider();

  try {
    return await provider.search(request);
  } catch (error) {
    console.error(`[Search] Error from ${provider.name}:`, error);
    return {
      products: [],
      facets: [],
      pagination: {
        page: request.page ?? 1,
        pageSize: request.pageSize ?? 20,
        totalResults: 0,
        totalPages: 0,
      },
      query: request.query,
      provider: provider.name,
    };
  }
}

/**
 * Get search suggestions / autocomplete.
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5,
): Promise<SearchSuggestion[]> {
  if (!query.trim()) return [];

  const provider = await getSearchProvider();

  try {
    return await provider.getSuggestions(query, limit);
  } catch (error) {
    console.error(`[Search] Suggestions error from ${provider.name}:`, error);
    return [];
  }
}

/**
 * Get products by IDs. Useful for shopping lists, quick order, etc.
 */
export async function getProductsByIds(
  productIds: number[],
  companyContext?: CompanySearchContext,
): Promise<SearchProduct[]> {
  if (productIds.length === 0) return [];

  const provider = await getSearchProvider();

  try {
    return await provider.getProductsByIds(productIds, companyContext);
  } catch (error) {
    console.error(`[Search] getProductsByIds error from ${provider.name}:`, error);
    return [];
  }
}

/**
 * Quick search helper -- simplified interface for the header search bar
 * and quick order form. Returns just products (no facets/pagination).
 */
export async function quickSearch(
  query: string,
  limit: number = 10,
  companyContext?: CompanySearchContext,
): Promise<SearchProduct[]> {
  if (!query.trim()) return [];

  const provider = await getSearchProvider();

  try {
    const response = await provider.search({
      query,
      pageSize: limit,
      companyContext,
    });
    return response.products;
  } catch (error) {
    console.error(`[Search] Quick search error from ${provider.name}:`, error);
    return [];
  }
}

/**
 * Get information about the currently active search provider.
 */
export async function getSearchProviderInfo(): Promise<{
  name: string;
  isConfigured: boolean;
}> {
  const provider = await getSearchProvider();
  return {
    name: provider.name,
    isConfigured: provider.isConfigured(),
  };
}
