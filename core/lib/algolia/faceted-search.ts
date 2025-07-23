import algoliasearch from 'algoliasearch';
import { cache } from 'react';

import algoliaClient from './client';
import { searchResultsTransformer } from '../../data-transformers/search-results-transformer';

// Algolia index name
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'products';

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
  brand?: string | string[];
  category?: number;
  categoryIn?: number | number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  isFeatured?: boolean;
  stock?: string | string[];
  shipping?: string[];
  Color?: string | string[];
  Size?: string | string[];
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

// Build mappings between entityIds and actual facet values
async function buildFacetMappings(index: any) {
  try {
    // Get facet data to build mappings
    const facetResults = await index.search([{
      indexName: INDEX_NAME,
      query: '*',
      facets: ['categories_without_path', 'brand_name'],
      hitsPerPage: 0, // We only need facets, not hits
    }]);
    
    const searchResult = facetResults.results[0];
    const facets = searchResult.facets || {};
    
    // Build category mappings
    const categoryMappings: Record<number, string> = {};
    if (facets.categories_without_path) {
      Object.keys(facets.categories_without_path).forEach((categoryName, index) => {
        categoryMappings[index + 1] = categoryName; // entityId starts at 1
      });
    }
    
    // Build brand mappings
    const brandMappings: Record<number, string> = {};
    if (facets.brand_name) {
      Object.keys(facets.brand_name).forEach((brandName, index) => {
        brandMappings[index + 1] = brandName; // entityId starts at 1
      });
    }
    
    console.log('🔍 [Algolia] Built facet mappings:', {
      categories: categoryMappings,
      brands: brandMappings
    });
    
    return {
      categories: categoryMappings,
      brands: brandMappings
    };
  } catch (error) {
    console.error('❌ [Algolia] Error building facet mappings:', error);
    return {
      categories: {},
      brands: {}
    };
  }
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
            appId: !!process.env.ALGOLIA_APPLICATION_ID,
    appKey: !!process.env.ALGOLIA_SEARCH_API_KEY,
        indexName: !!process.env.ALGOLIA_INDEX_NAME
      }
    });

    if (!algoliaClient) {
      throw new Error('Algolia client is not initialized');
    }
    
    // In algoliasearch v5, we need to use the search method directly
    // The client itself is the search function
    const index = algoliaClient;
    
    // Create mappings for entityIds to actual values
    // We'll need to get the facet data first to build these mappings
    const facetMappings = await buildFacetMappings(index);
    
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
      Color,
      Size,
      ...additionalParams
    } = params;

    // Build Algolia search parameters
    const searchParams: any = {
      query: term || '*', // Use wildcard for empty search terms
      page,
      hitsPerPage: limit,
      facets: [
        'categories_without_path', 
        'brand_name', 
        'default_price', 
        'in_stock',
        'is_visible',
        'Color',  // Add Color facet
        'Size'    // Add Size facet
      ],
      facetFilters: [],
      numericFilters: [],
      filters: '',
    };

    // Handle sorting (commented out as it might be causing facet issues)
    // if (sort && SORT_MAPPING[sort]) {
    //   searchParams.sortFacetBy = SORT_MAPPING[sort];
    // }

    // Handle brand filters
    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : [brand];
      if (brandArray.length > 0) {
        // Map entityIds back to actual brand names
        const brandNames = brandArray.map(id => facetMappings.brands[id]).filter(Boolean);
        if (brandNames.length > 0) {
          searchParams.facetFilters.push(`brand_name:${brandNames.join(',')}`);
        }
      }
    }

    // Handle category filters
    if (categoryIn) {
      const categoryArray = Array.isArray(categoryIn) ? categoryIn : [categoryIn];
      if (categoryArray.length > 0) {
        // Map entityIds back to actual category names
        const categoryNames = categoryArray.map(id => facetMappings.categories[id]).filter(Boolean);
        if (categoryNames.length > 0) {
          searchParams.facetFilters.push(`categories_without_path:${categoryNames.join(',')}`);
        }
      }
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
    if (stock) {
      const stockArray = Array.isArray(stock) ? stock : [stock];
      if (stockArray.includes('in_stock')) {
        searchParams.facetFilters.push('in_stock:true');
      }
    }

    // Handle Color filters
    if (Color) {
      const colorArray = Array.isArray(Color) ? Color : [Color];
      if (colorArray.length > 0) {
        searchParams.facetFilters.push(`Color:${colorArray.join(',')}`);
      }
    }

    // Handle Size filters
    if (Size) {
      const sizeArray = Array.isArray(Size) ? Size : [Size];
      if (sizeArray.length > 0) {
        searchParams.facetFilters.push(`Size:${sizeArray.join(',')}`);
      }
    }

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
      console.log('🔍 [Algolia] Raw facets from Algolia:', JSON.stringify(searchResult?.facets, null, 2));
      
      // Log what facets we're requesting
      console.log('🔍 [Algolia] Requested facets:', searchParams.facets);
      
      // Log available facet keys
      if (searchResult?.facets) {
        console.log('🔍 [Algolia] Available facet keys:', Object.keys(searchResult.facets));
      }
      
      // Transform Algolia results to match BigCommerce format
      const transformedProducts = await searchResultsTransformer(searchResult.hits);
      
      // Build facets from Algolia's facet data, or from search results if facets are empty
      let facets = [];
      if (searchResult.facets && Object.keys(searchResult.facets).length > 0) {
        console.log('🔍 [Algolia] Building facets from Algolia data:', Object.keys(searchResult.facets));
        facets = buildFacetsFromAlgoliaFacets(searchResult.facets, params);
        console.log('🔍 [Algolia] Built facets:', facets.map(f => ({ name: f.name, type: f.__typename })));
      } else {
        // Fallback: build facets from search results
        console.log('🔍 [Algolia] Building facets from search results (fallback)');
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
  console.log('🔍 [Algolia] Processing facets:', Object.keys(algoliaFacets));
  const facets = [];

  // Extract categories from Algolia facets
  if (algoliaFacets?.categories_without_path) {
    const categoryFacet = {
      __typename: 'CategorySearchFilter',
      name: 'Category',
      isCollapsedByDefault: false,
      displayProductCount: true,
      categories: Object.entries(algoliaFacets.categories_without_path).map(([name, count], index) => ({
        entityId: index + 1, // Give each category a unique entityId
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
      brands: Object.entries(algoliaFacets.brand_name).map(([name, count], index) => ({
        entityId: index + 1, // Give each brand a unique entityId
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
      name: 'IN STOCK',
      isCollapsedByDefault: false,
      displayProductCount: true,
      isInStock: {
        isSelected: params.stock?.includes('in_stock') || false,
        productCount: algoliaFacets.in_stock.true || 0,
      },
    };
    facets.push(availabilityFacet);
  }

  // Extract Color from Algolia facets
  if (algoliaFacets?.Color) {
    const colorFacet = {
      __typename: 'ProductAttributeSearchFilter',
      name: 'COLOR',
      filterName: 'Color',
      isCollapsedByDefault: false,
      displayProductCount: true,
      attributes: Object.entries(algoliaFacets.Color).map(([value, count]) => ({
        value,
        isSelected: params.Color?.includes(value) || false,
        productCount: count as number,
      })),
    };
    facets.push(colorFacet);
  }

  // Extract Size from Algolia facets
  if (algoliaFacets?.Size) {
    const sizeFacet = {
      __typename: 'ProductAttributeSearchFilter',
      name: 'SIZE',
      filterName: 'Size',
      isCollapsedByDefault: false,
      displayProductCount: true,
      attributes: Object.entries(algoliaFacets.Size).map(([value, count]) => ({
        value,
        isSelected: params.Size?.includes(value) || false,
        productCount: count as number,
      })),
    };
    facets.push(sizeFacet);
  }

  // Extract inventory tracking if available
  if (algoliaFacets?.inventory_tracking) {
    const inventoryFacet = {
      __typename: 'OtherSearchFilter',
      name: 'Inventory Tracking',
      isCollapsedByDefault: true,
      displayProductCount: true,
      inventoryTracking: Object.entries(algoliaFacets.inventory_tracking).map(([value, count]) => ({
        value,
        isSelected: false,
        productCount: count as number,
      })),
    };
    facets.push(inventoryFacet);
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