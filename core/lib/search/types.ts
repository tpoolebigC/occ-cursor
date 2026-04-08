/**
 * Search Provider Abstraction Layer
 *
 * Defines a unified interface for pluggable search providers (Algolia, BigCommerce,
 * SearchSpring, or custom). Each provider must implement the SearchProvider interface.
 *
 * Key design decisions:
 * - Server-side only (these run in Next.js server actions / RSC)
 * - Company catalog filtering is first-class (B2B requirement)
 * - Faceted search support built in
 * - Provider-agnostic result types
 */

// ============================================================================
// Core search types
// ============================================================================

export interface SearchProduct {
  /** Unique product identifier (provider-specific, e.g. Algolia objectID or BC entityId) */
  id: string;
  /** BigCommerce product entity ID */
  productId: number;
  /** Default variant entity ID */
  variantId?: number;
  /** Product name */
  name: string;
  /** Product SKU */
  sku: string;
  /** Price (current / sale price) */
  price: number;
  /** Original price before sale (optional) */
  basePrice?: number;
  /** Sale price if on sale */
  salePrice?: number;
  /** Currency code (e.g. "USD") */
  currencyCode?: string;
  /** Main product image URL */
  imageUrl?: string;
  /** Short description */
  description?: string;
  /** Product URL path (e.g. "/my-product/") */
  path?: string;
  /** Brand name */
  brand?: string;
  /** Category names */
  categories?: string[];
  /** Product availability */
  availability?: 'available' | 'preorder' | 'unavailable';
  /** Stock quantity (-1 = unlimited) */
  inventory?: number;
  /** Custom fields / metadata (provider-specific) */
  customFields?: Record<string, string | number | boolean>;
  /** Search result relevance score (0-1, higher = more relevant) */
  relevanceScore?: number;
}

export interface SearchFacet {
  /** Facet field name (e.g. "brand", "category", "price") */
  field: string;
  /** Display label */
  label: string;
  /** Facet type */
  type: 'value' | 'range' | 'hierarchical';
  /** Facet values with counts */
  values: SearchFacetValue[];
}

export interface SearchFacetValue {
  /** The facet value */
  value: string;
  /** Display label */
  label: string;
  /** Number of matching products */
  count: number;
  /** Whether this value is currently selected */
  isSelected?: boolean;
}

export interface SearchSort {
  field: string;
  direction: 'asc' | 'desc';
  label?: string;
}

export interface SearchPagination {
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}

// ============================================================================
// Search request / response
// ============================================================================

export interface SearchRequest {
  /** Search query string */
  query: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Results per page */
  pageSize?: number;
  /** Sort configuration */
  sort?: SearchSort;
  /** Active facet filters */
  filters?: SearchFilter[];
  /** Company context for catalog filtering */
  companyContext?: CompanySearchContext;
  /** Additional provider-specific options */
  providerOptions?: Record<string, unknown>;
}

export interface SearchFilter {
  field: string;
  /** The filter operator */
  operator: 'eq' | 'in' | 'range' | 'contains';
  /** Single value for eq/contains, array for in, [min, max] for range */
  value: string | string[] | [number, number];
}

export interface SearchResponse {
  /** Matching products */
  products: SearchProduct[];
  /** Available facets */
  facets: SearchFacet[];
  /** Pagination info */
  pagination: SearchPagination;
  /** Query that was executed (may be corrected for typos) */
  query: string;
  /** Corrected query if typo correction was applied */
  correctedQuery?: string;
  /** Provider name for debugging */
  provider: string;
  /** Time taken in ms */
  responseTimeMs?: number;
}

// ============================================================================
// Company search context (B2B catalog segregation)
// ============================================================================

export interface CompanySearchContext {
  /** B2B company ID */
  companyId: number;
  /** Company name (for logging/display) */
  companyName?: string;
  /** BigCommerce customer group ID associated with this company */
  customerGroupId?: number;
  /** BigCommerce price list IDs assigned to this company */
  priceListIds?: number[];
  /** BigCommerce category IDs this company has access to */
  allowedCategoryIds?: number[];
  /** Product IDs this company is restricted to (if using product-level access) */
  allowedProductIds?: number[];
  /** Catalog ID if using B2B catalog assignments */
  catalogId?: number;
}

// ============================================================================
// Search Provider interface
// ============================================================================

export interface SearchProvider {
  /** Unique identifier for this provider */
  readonly name: string;

  /**
   * Perform a product search.
   * Must handle company catalog filtering if companyContext is provided.
   */
  search(request: SearchRequest): Promise<SearchResponse>;

  /**
   * Get search suggestions / autocomplete results.
   * Returns a lightweight list of suggestions (no facets, no full product data).
   */
  getSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>;

  /**
   * Get products by IDs (e.g. for shopping list product lookup).
   */
  getProductsByIds(productIds: number[], companyContext?: CompanySearchContext): Promise<SearchProduct[]>;

  /**
   * Check if this provider is properly configured and ready to use.
   */
  isConfigured(): boolean;
}

export interface SearchSuggestion {
  /** Suggestion text */
  text: string;
  /** Type of suggestion */
  type: 'product' | 'category' | 'brand' | 'query';
  /** Additional data (e.g. productId, categoryId) */
  data?: Record<string, unknown>;
}

// ============================================================================
// Provider factory
// ============================================================================

export type SearchProviderName = 'bigcommerce' | 'algolia' | 'searchspring' | 'custom';
