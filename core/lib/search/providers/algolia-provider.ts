/**
 * Algolia Search Provider
 *
 * Wraps the Algolia search client into the SearchProvider interface.
 * Supports company catalog filtering via Algolia facet filters.
 */

import type {
  SearchProvider,
  SearchRequest,
  SearchResponse,
  SearchProduct,
  SearchFacet,
  SearchSuggestion,
  CompanySearchContext,
} from '../types';

export class AlgoliaSearchProvider implements SearchProvider {
  readonly name = 'algolia';

  private appId: string;
  private searchKey: string;
  private indexName: string;

  constructor() {
    this.appId = process.env.ALGOLIA_APPLICATION_ID || process.env.ALGOLIA_APP_ID || '';
    this.searchKey = process.env.ALGOLIA_SEARCH_API_KEY || process.env.ALGOLIA_SEARCH_KEY || '';
    this.indexName = process.env.ALGOLIA_INDEX_NAME || '';
  }

  isConfigured(): boolean {
    return !!(this.appId && this.searchKey && this.indexName);
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const client = await this.getClient();

    const page = (request.page ?? 1) - 1; // Algolia is 0-indexed
    const hitsPerPage = request.pageSize ?? 20;

    // Build filter string
    const filterParts: string[] = [];

    // Company catalog filter
    if (request.companyContext) {
      const companyFilters = this.buildCompanyCatalogFilters(request.companyContext);
      if (companyFilters) {
        filterParts.push(companyFilters);
      }
    }

    // User-applied facet filters
    if (request.filters?.length) {
      for (const filter of request.filters) {
        const filterStr = this.buildAlgoliaFilter(filter);
        if (filterStr) filterParts.push(filterStr);
      }
    }

    const searchParams: Record<string, unknown> = {
      query: request.query,
      page,
      hitsPerPage,
      facets: ['*'],
      attributesToRetrieve: [
        'objectID',
        'name',
        'sku',
        'price',
        'sale_price',
        'image_url',
        'description',
        'url',
        'brand',
        'categories',
        'availability',
        'inventory_level',
      ],
    };

    if (filterParts.length > 0) {
      searchParams.filters = filterParts.join(' AND ');
    }

    if (request.sort) {
      // Algolia uses separate replica indices for sorting.
      // This assumes standard naming convention: {index}_price_asc, etc.
      // In production, configure replica indices in Algolia dashboard.
    }

    try {
      const result = await client.searchSingleIndex({
        indexName: this.indexName,
        searchParams,
      });

      const products: SearchProduct[] = (result.hits || []).map((hit: any) =>
        this.mapHitToProduct(hit),
      );

      const facets: SearchFacet[] = this.mapFacets(result.facets || {});

      return {
        products,
        facets,
        pagination: {
          page: (result.page ?? 0) + 1,
          pageSize: result.hitsPerPage ?? hitsPerPage,
          totalResults: result.nbHits ?? 0,
          totalPages: result.nbPages ?? 0,
        },
        query: request.query,
        correctedQuery: result.queryAfterRemoval || undefined,
        provider: this.name,
        responseTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[Algolia] Search error:', error);
      return {
        products: [],
        facets: [],
        pagination: { page: 1, pageSize: hitsPerPage, totalResults: 0, totalPages: 0 },
        query: request.query,
        provider: this.name,
        responseTimeMs: Date.now() - startTime,
      };
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const client = await this.getClient();

    try {
      const result = await client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: {
          query,
          hitsPerPage: limit,
          attributesToRetrieve: ['objectID', 'name', 'sku', 'brand', 'categories'],
        },
      });

      return (result.hits || []).map((hit: any) => ({
        text: hit.name || hit.sku || '',
        type: 'product' as const,
        data: {
          productId: parseInt(hit.objectID, 10) || 0,
          sku: hit.sku,
          brand: hit.brand,
        },
      }));
    } catch (error) {
      console.error('[Algolia] Suggestions error:', error);
      return [];
    }
  }

  async getProductsByIds(
    productIds: number[],
    companyContext?: CompanySearchContext,
  ): Promise<SearchProduct[]> {
    if (productIds.length === 0) return [];

    const client = await this.getClient();

    try {
      const filterParts = [
        `objectID:${productIds.join(' OR objectID:')}`,
      ];

      if (companyContext) {
        const companyFilter = this.buildCompanyCatalogFilters(companyContext);
        if (companyFilter) filterParts.push(companyFilter);
      }

      const result = await client.searchSingleIndex({
        indexName: this.indexName,
        searchParams: {
          query: '',
          filters: filterParts.join(' AND '),
          hitsPerPage: productIds.length,
        },
      });

      return (result.hits || []).map((hit: any) => this.mapHitToProduct(hit));
    } catch (error) {
      console.error('[Algolia] getProductsByIds error:', error);
      return [];
    }
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private async getClient() {
    // Lazy import to avoid errors when Algolia env vars are not set
    const { algoliasearch } = await import('algoliasearch');
    return algoliasearch(this.appId, this.searchKey);
  }

  private mapHitToProduct(hit: any): SearchProduct {
    return {
      id: hit.objectID || '',
      productId: parseInt(hit.objectID, 10) || 0,
      name: hit.name || '',
      sku: hit.sku || '',
      price: hit.sale_price || hit.price || 0,
      basePrice: hit.price || undefined,
      salePrice: hit.sale_price || undefined,
      imageUrl: hit.image_url || hit.imageUrl || undefined,
      description: hit.description || undefined,
      path: hit.url || hit.path || undefined,
      brand: hit.brand || undefined,
      categories: hit.categories || undefined,
      availability: hit.availability || undefined,
      inventory: hit.inventory_level,
      relevanceScore: hit._rankingInfo?.firstMatchedWord !== undefined ? 1 : undefined,
    };
  }

  private mapFacets(algoliaFacets: Record<string, Record<string, number>>): SearchFacet[] {
    return Object.entries(algoliaFacets).map(([field, values]) => ({
      field,
      label: this.formatFacetLabel(field),
      type: 'value' as const,
      values: Object.entries(values).map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
    }));
  }

  private formatFacetLabel(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private buildCompanyCatalogFilters(ctx: CompanySearchContext): string | null {
    const parts: string[] = [];

    // Filter by allowed category IDs
    if (ctx.allowedCategoryIds?.length) {
      const categoryFilter = ctx.allowedCategoryIds
        .map((id) => `category_ids:${id}`)
        .join(' OR ');
      parts.push(`(${categoryFilter})`);
    }

    // Filter by allowed product IDs
    if (ctx.allowedProductIds?.length) {
      const productFilter = ctx.allowedProductIds
        .map((id) => `objectID:${id}`)
        .join(' OR ');
      parts.push(`(${productFilter})`);
    }

    // Filter by customer group (some Algolia setups index customer group visibility)
    if (ctx.customerGroupId) {
      parts.push(`customer_group_ids:${ctx.customerGroupId}`);
    }

    return parts.length > 0 ? parts.join(' AND ') : null;
  }

  private buildAlgoliaFilter(filter: {
    field: string;
    operator: string;
    value: string | string[] | [number, number];
  }): string | null {
    switch (filter.operator) {
      case 'eq':
        return `${filter.field}:${filter.value}`;
      case 'in':
        if (Array.isArray(filter.value)) {
          return `(${(filter.value as string[]).map((v) => `${filter.field}:${v}`).join(' OR ')})`;
        }
        return null;
      case 'range':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [min, max] = filter.value as [number, number];
          return `${filter.field}:${min} TO ${max}`;
        }
        return null;
      case 'contains':
        // Algolia doesn't have contains; use regular search instead
        return null;
      default:
        return null;
    }
  }
}
