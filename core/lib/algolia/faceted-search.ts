import algoliasearch from 'algoliasearch';
import { cache } from 'react';

import algoliaClient from './client';
import { searchResultsTransformer } from '../../data-transformers/search-results-transformer';

// Algolia index name
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME || 'products';

// Sort mapping from BigCommerce to Algolia
const SORT_MAPPING = {
  featured: 'featured',
  newest: 'created_at_desc',
  best_selling: 'sales_count_desc',
  a_to_z: 'name_asc',
  z_to_a: 'name_desc',
  best_reviewed: 'rating_desc',
  lowest_price: 'price_asc',
  highest_price: 'price_desc',
  relevance: 'relevance',
} as const;

// Facet mapping
const FACET_MAPPING = {
  brand: 'brand',
  category: 'category',
  price: 'price_range',
  rating: 'rating',
  availability: 'availability',
  shipping: 'shipping',
} as const;

interface AlgoliaSearchParams {
  term?: string;
  page?: number;
  limit?: number;
  sort?: keyof typeof SORT_MAPPING;
  brand?: string[];
  category?: number;
  categoryIn?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  isFeatured?: boolean;
  stock?: string[];
  shipping?: string[];
  [key: string]: any;
}

interface AlgoliaSearchResult {
  facets: {
    items: Array<{
      __typename: string;
      name: string;
      isCollapsedByDefault: boolean;
      displayProductCount: boolean;
      brands?: Array<{
        entityId: number;
        name: string;
        isSelected: boolean;
        productCount: number;
      }>;
      categories?: Array<{
        entityId: number;
        name: string;
        isSelected: boolean;
        productCount: number;
        subCategories?: Array<{
          entityId: number;
          name: string;
          isSelected: boolean;
          productCount: number;
        }>;
      }>;
      attributes?: Array<{
        value: string;
        isSelected: boolean;
        productCount: number;
      }>;
      ratings?: Array<{
        value: number;
        isSelected: boolean;
        productCount: number;
      }>;
      selected?: {
        minPrice: number;
        maxPrice: number;
      };
    }>;
  };
  products: {
    collectionInfo: {
      totalItems: number;
    };
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    items: any[];
  };
}

export const fetchAlgoliaFacetedSearch = cache(
  async (params: AlgoliaSearchParams): Promise<AlgoliaSearchResult> => {
    console.log('🔍 [Algolia] Starting faceted search with params:', JSON.stringify(params, null, 2));
    
    console.log('🔍 [Algolia] Client check:', {
      clientExists: !!algoliaClient,
      clientType: typeof algoliaClient,
      clientKeys: algoliaClient ? Object.keys(algoliaClient) : 'N/A',
      indexName: INDEX_NAME,
      envVars: {
        appId: !!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        appKey: !!process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY,
        indexName: !!process.env.ALGOLIA_INDEX_NAME
      }
    });

    if (!algoliaClient) {
      throw new Error('Algolia client is not initialized');
    }
    
    // In algoliasearch v5, we need to use the search method directly
    // The client itself is the search function
    const index = algoliaClient;
    
    // Extract search parameters
    const {
      term = '',
      page = 0,
      limit = 9,
      sort = 'featured',
      brand,
      category,
      categoryIn,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      isFeatured,
      stock,
      shipping,
      ...additionalParams
    } = params;

    // Build Algolia search parameters
    const searchParams: any = {
      query: term || '*', // Use wildcard for empty search terms
      page,
      hitsPerPage: limit,
      facets: ['categories_without_path', 'brand_name', 'default_price', 'in_stock'],
      facetFilters: [],
      numericFilters: [],
      filters: '',
    };

    // Handle sorting
    if (sort && SORT_MAPPING[sort]) {
      searchParams.sortFacetBy = SORT_MAPPING[sort];
    }

    // Handle brand filters
    if (brand && brand.length > 0) {
      searchParams.facetFilters.push(`brand_name:${brand.join(',')}`);
    }

    // Handle category filters
    if (category) {
      searchParams.facetFilters.push(`category_ids:${category}`);
    }
    if (categoryIn && categoryIn.length > 0) {
      searchParams.facetFilters.push(`category_ids:${categoryIn.join(',')}`);
    }

    // Handle price filters
    if (minPrice || maxPrice) {
      const priceFilter = [];
      if (minPrice) priceFilter.push(`default_price >= ${minPrice}`);
      if (maxPrice) priceFilter.push(`default_price <= ${maxPrice}`);
      searchParams.numericFilters.push(priceFilter.join(' AND '));
    }

    // Handle rating filters (skip for now since rating doesn't exist in data)
    // if (minRating || maxRating) {
    //   const ratingFilter = [];
    //   if (minRating) ratingFilter.push(`rating >= ${minRating}`);
    //   if (maxRating) ratingFilter.push(`rating <= ${maxRating}`);
    //   searchParams.numericFilters.push(ratingFilter.join(' AND '));
    // }

    // Handle featured filter (skip for now since is_featured doesn't exist in data)
    // if (isFeatured) {
    //   searchParams.facetFilters.push('is_featured:true');
    // }

    // Handle stock filters
    if (stock && stock.includes('in_stock')) {
      searchParams.facetFilters.push('in_stock:true');
    }

    // Handle shipping filters (skip for now since shipping doesn't exist in data)
    // if (shipping && shipping.includes('free_shipping')) {
    //   searchParams.facetFilters.push('shipping:free');
    // }

    // Handle additional product attributes
    Object.entries(additionalParams).forEach(([key, values]) => {
      if (key.startsWith('attr_') && values && Array.isArray(values)) {
        const attributeName = key.replace('attr_', '');
        searchParams.facetFilters.push(`${attributeName}:${values.join(',')}`);
      }
    });

    console.log('🔍 [Algolia] Faceted search params:', JSON.stringify(searchParams, null, 2));

    try {
      // In algoliasearch v5, we need to use the correct search format
      // Only pass valid Algolia parameters
      const algoliaSearchParams = {
        page: searchParams.page,
        hitsPerPage: searchParams.hitsPerPage,
        facets: searchParams.facets,
        facetFilters: searchParams.facetFilters,
        numericFilters: searchParams.numericFilters,
        filters: searchParams.filters
      };
      
      console.log('🔍 [Algolia] Final search params being sent to Algolia:', JSON.stringify({
        indexName: INDEX_NAME,
        query: term,
        ...algoliaSearchParams
      }, null, 2));
      
      const results = await index.search([{
        indexName: INDEX_NAME,
        query: term || '*', // Ensure we use wildcard for empty terms
        ...algoliaSearchParams
      }]);
      
      // Get the first result (we're only searching one index)
      const searchResult = results.results[0];
      
      console.log('✅ [Algolia] Faceted search found:', searchResult?.nbHits || 0, 'results');
      console.log('🔍 [Algolia] Facets returned:', JSON.stringify(searchResult?.facets, null, 2));
      
      // Transform Algolia results to match BigCommerce format
      const transformedProducts = await searchResultsTransformer(searchResult.hits);
      
      // Build facets from Algolia's facet data, or from search results if facets are empty
      let facets = [];
      if (searchResult.facets && Object.keys(searchResult.facets).length > 0) {
        facets = buildFacetsFromAlgoliaFacets(searchResult.facets, params);
      } else {
        // Fallback: build facets from search results
        facets = buildFacetsFromSearchResults(searchResult.hits, params);
      }

      // Calculate pagination info
      const totalPages = Math.ceil(searchResult.nbHits / limit);
      const hasNextPage = page < totalPages - 1;
      const hasPreviousPage = page > 0;

      return {
        facets: {
          items: facets,
        },
        products: {
          collectionInfo: {
            totalItems: searchResult.nbHits,
          },
          pageInfo: {
            hasNextPage,
            hasPreviousPage,
            startCursor: hasPreviousPage ? `page_${page - 1}` : null,
            endCursor: hasNextPage ? `page_${page + 1}` : null,
          },
          items: transformedProducts,
        },
      };
    } catch (error) {
      console.error('❌ [Algolia] Faceted search error:', error);
      throw error;
    }
  }
);

function buildFacetsFromAlgoliaFacets(algoliaFacets: any, params: AlgoliaSearchParams) {
  const facets = [];

  // Extract categories from Algolia facets
  if (algoliaFacets?.categories_without_path) {
    const categoryFacet = {
      __typename: 'CategorySearchFilter',
      name: 'Category',
      isCollapsedByDefault: false,
      displayProductCount: true,
      categories: Object.entries(algoliaFacets.categories_without_path).map(([name, count]) => ({
        entityId: 0,
        name,
        isSelected: false, // TODO: implement selection logic
        productCount: count as number,
        subCategories: [],
      })),
    };
    facets.push(categoryFacet);
  }

  // Extract brands from Algolia facets
  if (algoliaFacets?.brand_name) {
    const brandFacet = {
      __typename: 'BrandSearchFilter',
      name: 'Brand',
      isCollapsedByDefault: false,
      displayProductCount: true,
      brands: Object.entries(algoliaFacets.brand_name).map(([name, count]) => ({
        entityId: 0,
        name,
        isSelected: params.brand?.includes(name) || false,
        productCount: count as number,
      })),
    };
    facets.push(brandFacet);
  }

  // Extract price from Algolia facets (using default_price)
  if (algoliaFacets?.default_price) {
    const priceFacet = {
      __typename: 'PriceSearchFilter',
      name: 'Price',
      isCollapsedByDefault: false,
      displayProductCount: true,
      selected: {
        minPrice: params.minPrice || 0,
        maxPrice: params.maxPrice || 0,
      },
    };
    facets.push(priceFacet);
  }

  // Extract availability from Algolia facets (using in_stock)
  if (algoliaFacets?.in_stock) {
    const availabilityFacet = {
      __typename: 'OtherSearchFilter',
      name: 'Availability',
      isCollapsedByDefault: false,
      displayProductCount: true,
      isInStock: {
        isSelected: params.stock?.includes('in_stock') || false,
        productCount: algoliaFacets.in_stock.true || 0,
      },
    };
    facets.push(availabilityFacet);
  }

  return facets;
}

function buildFacetsFromSearchResults(hits: any[], params: AlgoliaSearchParams) {
  const facets = [];

  // Extract categories from search results
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  const priceRanges = new Map<string, number>();
  const stockCounts = { inStock: 0, outOfStock: 0 };
  
  hits.forEach((hit) => {
    // Count categories
    if (hit.categories_without_path && Array.isArray(hit.categories_without_path)) {
      hit.categories_without_path.forEach((category: string) => {
        if (category && category !== 'Shop All') { // Skip "Shop All" as it's not useful for filtering
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      });
    }
    
    // Count brands
    if (hit.brand_name && hit.brand_name.trim() !== '') {
      brandCounts.set(hit.brand_name, (brandCounts.get(hit.brand_name) || 0) + 1);
    }
    
    // Count stock status
    if (hit.in_stock) {
      stockCounts.inStock++;
    } else {
      stockCounts.outOfStock++;
    }
    
    // Count price ranges (simplified)
    if (hit.default_price) {
      const price = hit.default_price;
      let range = '';
      if (price < 25) range = 'Under $25';
      else if (price < 50) range = '$25 - $50';
      else if (price < 100) range = '$50 - $100';
      else range = 'Over $100';
      priceRanges.set(range, (priceRanges.get(range) || 0) + 1);
    }
  });
  
  // Build category facet
  if (categoryCounts.size > 0) {
    const categoryFacet = {
      __typename: 'CategorySearchFilter',
      name: 'Category',
      isCollapsedByDefault: false,
      displayProductCount: true,
      categories: Array.from(categoryCounts.entries()).map(([name, count]) => ({
        entityId: 0,
        name,
        isSelected: false,
        productCount: count,
        subCategories: [],
      })),
    };
    facets.push(categoryFacet);
  }

  // Build brand facet
  if (brandCounts.size > 0) {
    const brandFacet = {
      __typename: 'BrandSearchFilter',
      name: 'Brand',
      isCollapsedByDefault: false,
      displayProductCount: true,
      brands: Array.from(brandCounts.entries()).map(([name, count]) => ({
        entityId: 0,
        name,
        isSelected: params.brand?.includes(name) || false,
        productCount: count,
      })),
    };
    facets.push(brandFacet);
  }

  // Build price facet
  if (priceRanges.size > 0) {
    const priceFacet = {
      __typename: 'PriceSearchFilter',
      name: 'Price',
      isCollapsedByDefault: false,
      displayProductCount: true,
      selected: {
        minPrice: params.minPrice || 0,
        maxPrice: params.maxPrice || 0,
      },
    };
    facets.push(priceFacet);
  }

  // Build availability facet
  if (stockCounts.inStock > 0 || stockCounts.outOfStock > 0) {
    const availabilityFacet = {
      __typename: 'OtherSearchFilter',
      name: 'Availability',
      isCollapsedByDefault: false,
      displayProductCount: true,
      isInStock: {
        isSelected: params.stock?.includes('in_stock') || false,
        productCount: stockCounts.inStock,
      },
    };
    facets.push(availabilityFacet);
  }

  return facets;
} 