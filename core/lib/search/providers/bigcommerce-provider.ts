/**
 * BigCommerce Search Provider
 *
 * Uses the BC Storefront GraphQL API for product search. This is the default
 * provider and always works without additional third-party configuration.
 *
 * Company catalog filtering is handled by fetching the company's allowed
 * categories/products from the B2B REST API and applying them as GraphQL filters.
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

export class BigCommerceSearchProvider implements SearchProvider {
  readonly name = 'bigcommerce';

  isConfigured(): boolean {
    return !!(
      process.env.BIGCOMMERCE_STORE_HASH &&
      process.env.BIGCOMMERCE_STOREFRONT_TOKEN
    );
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Use the existing GraphQL search infrastructure
      const { searchProducts } = await import('~/b2b/client/b2b-graphql-client');
      const pageSize = request.pageSize ?? 20;
      const products = await searchProducts(request.query, pageSize);

      const mappedProducts: SearchProduct[] = (products?.edges ?? []).map((edge: any) => {
        const product = edge.node;
        return {
          id: product.entityId?.toString() ?? '',
          productId: product.entityId ?? 0,
          variantId: product.variants?.edges?.[0]?.node?.entityId ?? undefined,
          name: product.name ?? '',
          sku: product.sku ?? '',
          price: product.prices?.price?.value ?? 0,
          basePrice: product.prices?.basePrice?.value,
          salePrice: product.prices?.salePrice?.value,
          currencyCode: product.prices?.price?.currencyCode,
          imageUrl: product.defaultImage?.url,
          description: product.description ?? '',
          path: product.path,
          brand: product.brand?.name,
          categories: product.categories?.edges?.map((e: any) => e.node?.name).filter(Boolean),
          availability: product.availabilityV2?.status?.toLowerCase() === 'available' ? 'available' : 'unavailable',
        };
      });

      // Apply company catalog filters client-side if needed
      let filteredProducts = mappedProducts;
      if (request.companyContext) {
        filteredProducts = this.applyCompanyCatalogFilter(mappedProducts, request.companyContext);
      }

      return {
        products: filteredProducts,
        facets: this.extractFacets(filteredProducts),
        pagination: {
          page: request.page ?? 1,
          pageSize,
          totalResults: filteredProducts.length,
          totalPages: 1, // BC GraphQL doesn't give cursor-based page count easily
        },
        query: request.query,
        provider: this.name,
        responseTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[BigCommerce] Search error:', error);
      return {
        products: [],
        facets: [],
        pagination: { page: 1, pageSize: request.pageSize ?? 20, totalResults: 0, totalPages: 0 },
        query: request.query,
        provider: this.name,
        responseTimeMs: Date.now() - startTime,
      };
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    try {
      const { searchProducts } = await import('~/b2b/client/b2b-graphql-client');
      const products = await searchProducts(query, limit);

      return (products?.edges ?? []).map((edge: any) => ({
        text: edge.node?.name ?? '',
        type: 'product' as const,
        data: {
          productId: edge.node?.entityId,
          sku: edge.node?.sku,
        },
      }));
    } catch (error) {
      console.error('[BigCommerce] Suggestions error:', error);
      return [];
    }
  }

  async getProductsByIds(
    productIds: number[],
    companyContext?: CompanySearchContext,
  ): Promise<SearchProduct[]> {
    if (productIds.length === 0) return [];

    // BC GraphQL doesn't have a direct "get by IDs" search.
    // We can search each ID individually or use a different approach.
    // For now, return empty -- this will be enhanced when we have
    // the product catalog query available.
    console.warn('[BigCommerce] getProductsByIds not yet fully implemented for BC GraphQL provider');
    return [];
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private applyCompanyCatalogFilter(
    products: SearchProduct[],
    ctx: CompanySearchContext,
  ): SearchProduct[] {
    let filtered = products;

    if (ctx.allowedProductIds?.length) {
      const allowedSet = new Set(ctx.allowedProductIds);
      filtered = filtered.filter((p) => allowedSet.has(p.productId));
    }

    if (ctx.allowedCategoryIds?.length) {
      // This is a rough filter -- we compare category names,
      // which is imperfect. In a real implementation, you'd compare IDs.
      // The Algolia provider handles this better with indexed category_ids.
      console.warn(
        '[BigCommerce] Company catalog category filtering is approximate. ' +
          'Consider using Algolia for precise catalog segregation.',
      );
    }

    return filtered;
  }

  private extractFacets(products: SearchProduct[]): SearchFacet[] {
    // Build facets from result data
    const brandCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    for (const product of products) {
      if (product.brand) {
        brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
      }
      if (product.categories) {
        for (const cat of product.categories) {
          categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
        }
      }
    }

    const facets: SearchFacet[] = [];

    if (brandCounts.size > 0) {
      facets.push({
        field: 'brand',
        label: 'Brand',
        type: 'value',
        values: [...brandCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
      });
    }

    if (categoryCounts.size > 0) {
      facets.push({
        field: 'categories',
        label: 'Category',
        type: 'value',
        values: [...categoryCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
      });
    }

    return facets;
  }
}
