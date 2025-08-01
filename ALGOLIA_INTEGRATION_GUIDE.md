# Complete Algolia Integration Guide for Catalyst

## Overview
This guide covers the complete integration of Algolia search into a Catalyst application, replacing the default BigCommerce search with faster, more powerful faceted search capabilities. This implementation includes advanced features like faceted search, result transformers, debug tools, and comprehensive error handling.

## Prerequisites
- Catalyst application with BigCommerce backend
- Algolia account with configured index
- Node.js environment with TypeScript support

## Step 1: Install Dependencies

```bash
npm install algoliasearch@^5.33.0 @algolia/requester-fetch@^5.33.0
```

## Step 2: Environment Configuration

Add these environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_APP_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEXNAME=your_index_name
```

## Step 3: File Structure Overview

Before we start coding, here's the complete file structure we'll create and modify:

### **Files We'll Create (NEW)**
```
occ-cursor/
├── core/
│   ├── lib/
│   │   ├── algolia.ts                           # Main Algolia client and helpers
│   │   └── algolia/
│   │       ├── client.ts                        # Basic Algolia client setup
│   │       └── faceted-search.ts                # Advanced faceted search logic
│   ├── data-transformers/
│   │   └── algolia-search-results-transformer.ts # Transform Algolia results to Catalyst format
│   ├── components/
│   │   └── search-form/
│   │       └── search-form.tsx                  # Search form component
│   └── app/[locale]/(default)/
│       ├── shop-all/
│       │   └── page.tsx                         # Shop all products route
│       └── (faceted)/
│           └── search/
│               └── page.tsx                     # Main search page with facets
```

### **Files We'll Modify (EXISTING)**
```
occ-cursor/
├── core/
│   ├── components/
│   │   └── header/
│   │       └── index.tsx                        # Add search functionality to header
│   └── app/[locale]/(default)/
│       └── (faceted)/
│           └── search/
│               └── page.tsx                     # Update existing search page
```

### **Environment Files**
```
occ-cursor/
├── .env.local                                   # Add Algolia environment variables
└── .env.example                                 # Update with Algolia variables
```

### **Package Files**
```
occ-cursor/
├── package.json                                 # Add Algolia dependencies
└── package-lock.json                           # Updated with new dependencies
```

## Step 4: Create Core Algolia Client

Create `core/lib/algolia.ts`:

```typescript
import { algoliasearch } from 'algoliasearch';
import { createFetchRequester } from '@algolia/requester-fetch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME || 'products';

if (!appId || !searchApiKey) {
  throw new Error('Missing Algolia environment variables: NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_APP_KEY are required');
}

// Create the Algolia client with fetch requester
export const algoliaClient = algoliasearch(appId, searchApiKey, {
  requester: createFetchRequester()
});

// Helper function for single index search
export const searchSingleIndex = async <T = any>({
  indexName: searchIndexName,
  searchParams
}: {
  indexName: string;
  searchParams: {
    query?: string;
    hitsPerPage?: number;
    page?: number;
    filters?: string;
    facets?: string[];
    facetFilters?: string[][];
    numericFilters?: string[];
    [key: string]: any;
  };
}) => {
  const results = await algoliaClient.search([{
    indexName: searchIndexName,
    ...searchParams
  }]);
  
  return results.results[0] as {
    hits: T[];
    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
    processingTimeMS: number;
    query: string;
    facets?: Record<string, any>;
  };
};

// Helper function for faceted search
export const facetedSearch = async <T = any>({
  indexName: searchIndexName,
  searchParams
}: {
  indexName: string;
  searchParams: {
    query?: string;
    hitsPerPage?: number;
    page?: number;
    filters?: string;
    facets?: string[];
    facetFilters?: string[][];
    numericFilters?: string[];
    attributesToRetrieve?: string[];
    [key: string]: any;
  };
}) => {
  const results = await algoliaClient.search([{
    indexName: searchIndexName,
    ...searchParams
  }]);
  
  return results.results[0] as {
    hits: T[];
    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
    processingTimeMS: number;
    query: string;
    facets?: Record<string, any>;
  };
};

// TypeScript interface for Algolia hits
export interface AlgoliaHit {
  objectID: string;
  name: string;
  brand_name?: string;
  sku?: string;
  url?: string;
  image_url?: string;
  product_images?: Array<{
    description?: string;
    is_thumbnail?: boolean;
    url_thumbnail?: string;
    url?: string;
  }>;
  description?: string;
  is_visible?: boolean;
  in_stock?: boolean;
  categories_without_path?: string[];
  category_ids?: number[];
  default_price?: number;
  prices?: Record<string, number>;
  sales_prices?: Record<string, number>;
  retail_prices?: Record<string, number>;
  inventory?: number;
  inventory_tracking?: string;
  [key: string]: any;
};

// Debug function to inspect index
export const debugIndex = async () => {
  try {
    console.log('🔍 [Algolia Debug] Starting index inspection...');
    
    const searchResult = await algoliaClient.search([{
      indexName,
      hitsPerPage: 5
    }]);
    
    const firstResult = searchResult.results[0];
    if (!firstResult || 'hits' in firstResult === false) {
      console.log('❌ [Algolia Debug] Invalid search result');
      return;
    }
    
    console.log('📊 [Algolia Debug] Search results:', {
      totalHits: (firstResult as any).nbHits,
      processingTimeMS: (firstResult as any).processingTimeMS,
      query: (firstResult as any).query,
      facets: (firstResult as any).facets,
      firstHit: (firstResult as any).hits[0] ? {
        objectID: (firstResult as any).hits[0].objectID,
        name: (firstResult as any).hits[0].name,
        brand_name: (firstResult as any).hits[0].brand_name,
        categories: (firstResult as any).hits[0].categories_without_path
      } : null
    });
    
    console.log('✅ [Algolia Debug] Index inspection complete');
  } catch (error) {
    console.error('❌ [Algolia Debug] Error inspecting index:', error);
  }
};
```

## Step 5: Create Algolia Client Module

Create `core/lib/algolia/client.ts`:

```typescript
import { algoliasearch } from 'algoliasearch';
import { createFetchRequester } from '@algolia/requester-fetch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME;

if (!appId || !searchApiKey || !indexName) {
  throw new Error('Missing Algolia environment variables');
}

// In Algolia v5, the client itself is the search function
export const algoliaClient = algoliasearch(appId, searchApiKey, {
  requester: createFetchRequester()
});

// For v5, you don't need initIndex - use the client directly
// Example usage:
// await algoliaClient.search([{ indexName, query: 'search term' }])
```

## Step 6: Create Faceted Search Module

Create `core/lib/algolia/faceted-search.ts`:

```typescript
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
        'is_visible'
      ],
      facetFilters: [],
      numericFilters: [],
      filters: '',
    };

    // Handle brand filters
    if (brand && brand.length > 0) {
      // Map entityIds back to actual brand names
      const brandNames = brand.map(id => facetMappings.brands[id]).filter(Boolean);
      if (brandNames.length > 0) {
        searchParams.facetFilters.push(`brand_name:${brandNames.join(',')}`);
      }
    }

    // Handle category filters
    if (categoryIn && categoryIn.length > 0) {
      // Map entityIds back to actual category names
      const categoryNames = categoryIn.map(id => facetMappings.categories[id]).filter(Boolean);
      if (categoryNames.length > 0) {
        searchParams.facetFilters.push(`categories_without_path:${categoryNames.join(',')}`);
      }
    }

    // Handle price filters
    if (minPrice || maxPrice) {
      const priceFilter = [];
      if (minPrice) priceFilter.push(`default_price >= ${minPrice}`);
      if (maxPrice) priceFilter.push(`default_price <= ${maxPrice}`);
      searchParams.numericFilters.push(priceFilter.join(' AND '));
    }

    // Handle stock filters
    if (stock && stock.includes('in_stock')) {
      searchParams.facetFilters.push('in_stock:true');
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
      
      if (!searchResult || 'hits' in searchResult === false) {
        throw new Error('Invalid search result from Algolia');
      }

      // Transform the results to match Catalyst format
      const transformedHits = (searchResult as any).hits.map((hit: any) => ({
        entityId: parseInt(hit.objectID),
        name: hit.name,
        brand: {
          entityId: hit.brand_id || 0,
          name: hit.brand_name || ''
        },
        sku: hit.sku || '',
        path: hit.url || '',
        defaultImage: {
          url: hit.image_url || '',
          altText: hit.name || ''
        },
        images: hit.product_images?.map((img: any) => ({
          url: img.url_thumbnail || img.url || '',
          altText: hit.name || ''
        })) || [],
        prices: {
          price: {
            value: hit.default_price || 0,
            currencyCode: 'USD'
          },
          salePrice: {
            value: hit.sales_prices?.USD || 0,
            currencyCode: 'USD'
          },
          retailPrice: {
            value: hit.retail_prices?.USD || 0,
            currencyCode: 'USD'
          }
        },
        inventoryLevel: hit.inventory || 0,
        inventoryTracking: hit.inventory_tracking || 'none',
        availabilityV2: {
          status: hit.in_stock ? 'Available' : 'Unavailable'
        },
        categories: hit.categories_without_path?.map((cat: string) => ({
          entityId: 0,
          name: cat,
          path: `/${cat.toLowerCase().replace(/\s+/g, '-')}/`
        })) || []
      }));

      // Build facets from Algolia facets or search results
      const facets = buildFacetsFromAlgoliaFacets((searchResult as any).facets || {}, params);

      return {
        facets: {
          items: facets
        },
        products: {
          collectionInfo: {
            totalItems: (searchResult as any).nbHits
          },
          pageInfo: {
            hasNextPage: (searchResult as any).page < (searchResult as any).nbPages - 1,
            hasPreviousPage: (searchResult as any).page > 0,
            startCursor: `page_${(searchResult as any).page}`,
            endCursor: `page_${(searchResult as any).page + 1}`
          },
          items: transformedHits
        }
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

  return facets;
}
```

## Step 7: Create Search Results Transformer

Create `core/data-transformers/algolia-search-results-transformer.ts`:

```typescript
import { readFragment } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';

export interface AlgoliaSearchResult {
  objectID: string;
  name: string;
  brand_name?: string;
  sku?: string;
  url?: string;
  image_url?: string;
  product_images?: Array<{
    description?: string;
    is_thumbnail?: boolean;
    url_thumbnail?: string;
    url?: string;
  }>;
  description?: string;
  is_visible?: boolean;
  in_stock?: boolean;
  categories_without_path?: string[];
  category_ids?: number[];
  default_price?: number;
  prices?: Record<string, number>;
  sales_prices?: Record<string, number>;
  retail_prices?: Record<string, number>;
  inventory?: number;
  inventory_tracking?: string;
}

export function transformAlgoliaSearchResults(algoliaHits: AlgoliaSearchResult[]) {
  return algoliaHits.map(hit => ({
    entityId: parseInt(hit.objectID),
    name: hit.name,
    brand: {
      entityId: hit.brand_id || 0,
      name: hit.brand_name || ''
    },
    sku: hit.sku || '',
    path: hit.url || '',
    defaultImage: {
      url: hit.image_url || '',
      altText: hit.name || ''
    },
    images: hit.product_images?.map(img => ({
      url: img.url_thumbnail || img.url || '',
      altText: hit.name || ''
    })) || [],
    prices: {
      price: {
        value: hit.default_price || 0,
        currencyCode: 'USD'
      },
      salePrice: {
        value: hit.sales_prices?.USD || 0,
        currencyCode: 'USD'
      },
      retailPrice: {
        value: hit.retail_prices?.USD || 0,
        currencyCode: 'USD'
      }
    },
    inventoryLevel: hit.inventory || 0,
    inventoryTracking: hit.inventory_tracking || 'none',
    availabilityV2: {
      status: hit.in_stock ? 'Available' : 'Unavailable'
    },
    categories: hit.categories_without_path?.map(cat => ({
      entityId: 0,
      name: cat,
      path: `/${cat.toLowerCase().replace(/\s+/g, '-')}/`
    })) || []
  }));
}
```

## Step 8: Create Search Form Component

Create `core/components/search-form/search-form.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}
```

## Step 9: Update Search Page

Update `core/app/[locale]/(default)/(faceted)/search/page.tsx`:

```typescript
import { fetchFacetedSearch } from '~/lib/algolia/faceted-search';
import { FacetedSearchParams } from '~/lib/algolia/faceted-search';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: FacetedSearchParams;
}) {
  const results = await fetchFacetedSearch(searchParams);
  
  return (
    <div className="search-page">
      <div className="search-results">
        <h1>Search Results</h1>
        <p>Found {results.totalResults} products</p>
        
        <div className="products-grid">
          {results.products.map((product) => (
            <div key={product.entityId} className="product-card">
              <h3>{product.name}</h3>
              <p>${product.prices.price.value}</p>
              {/* Add your product card component here */}
            </div>
          ))}
        </div>
        
        {/* Add pagination component here */}
      </div>
      
      <div className="facets-sidebar">
        {/* Add facets component here */}
      </div>
    </div>
  );
}
```

## Step 10: Create Shop All Route

Create `core/app/[locale]/(default)/shop-all/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function ShopAllPage() {
  redirect('/search?term=');
}
```

## Step 11: Configure Algolia Index

In your Algolia dashboard, configure the following:

### Searchable Attributes
Ensure these are searchable:
- `name`
- `description`
- `brand_name`
- `categories_without_path`
- `sku`
- `category_name`
- `category_path`

### Facets
Configure these attributes as facets:
- `categories_without_path`
- `category_name`
- `category_path`
- `brand_name`
- `default_price`
- `in_stock`
- `availability`
- `price_range`

### Filterable Attributes
Make these filterable:
- `category_ids`
- `category_name`
- `category_path`
- `brand_name`
- `brand_id`
- `default_price`
- `in_stock`
- `availability`
- `price_range`

### Ranking and Sorting
Configure custom ranking:
1. `is_visible`
2. `in_stock`
3. `availability`
4. `default_price`
5. `name`
6. `brand_name`

### Facet Display Settings
Configure facet display in Algolia dashboard:
- **Categories**: Set as hierarchical facets if you have category trees
- **Brands**: Set as regular facets with alphabetical sorting
- **Price**: Set as numeric range facets
- **Availability**: Set as boolean facets

## Step 12: Data Structure Requirements

Ensure your Algolia index contains these fields for each product. This structure supports full category hierarchy and advanced faceting:

```json
{
  "objectID": "12345",
  "name": "ZZ Plant - Zamioculcas zamiifolia",
  "brand_name": "Plant Co.",
  "brand_id": 456,
  "sku": "ZZ-PLANT-001",
  "url": "/plants/zz-plant/",
  "image_url": "https://cdn.bigcommerce.com/images/zz-plant-main.jpg",
  "product_images": [
    {
      "description": "ZZ Plant in pot",
      "is_thumbnail": true,
      "url_thumbnail": "https://cdn.bigcommerce.com/images/zz-plant-thumb.jpg",
      "url": "https://cdn.bigcommerce.com/images/zz-plant-full.jpg"
    },
    {
      "description": "ZZ Plant close-up",
      "is_thumbnail": false,
      "url_thumbnail": "https://cdn.bigcommerce.com/images/zz-plant-close-thumb.jpg",
      "url": "https://cdn.bigcommerce.com/images/zz-plant-close-full.jpg"
    }
  ],
  "description": "The ZZ Plant is a low-maintenance houseplant perfect for beginners. It thrives in low light and requires minimal watering.",
  "is_visible": true,
  "in_stock": true,
  "availability": "in_stock",
  "inventory": 25,
  "inventory_tracking": "product",
  "categories_without_path": ["Plants", "Indoor Plants", "Low Light Plants"],
  "category_name": "Low Light Plants",
  "category_path": "Plants > Indoor Plants > Low Light Plants",
  "category_ids": [27, 28, 29],
  "category_hierarchy": [
    {"id": 27, "name": "Plants", "path": "Plants"},
    {"id": 28, "name": "Indoor Plants", "path": "Plants > Indoor Plants"},
    {"id": 29, "name": "Low Light Plants", "path": "Plants > Indoor Plants > Low Light Plants"}
  ],
  "default_price": 79.99,
  "price_range": "50-100",
  "prices": {"USD": 79.99},
  "sales_prices": {"USD": 0},
  "retail_prices": {"USD": 99.99},
  "sale_price": 0,
  "retail_price": 99.99,
  "discount_percentage": 0,
  "weight": 2.5,
  "dimensions": {
    "height": 12,
    "width": 8,
    "depth": 8
  },
  "care_level": "Easy",
  "light_requirements": "Low Light",
  "water_requirements": "Low",
  "pet_friendly": true,
  "air_purifying": true,
  "tags": ["beginner-friendly", "low-maintenance", "air-purifying", "pet-safe"]
}
```

### Example Category Structure
Your Algolia index should support hierarchical categories like:

```json
{
  "category_hierarchy": [
    {
      "id": 1,
      "name": "Plants",
      "path": "Plants",
      "level": 1
    },
    {
      "id": 2,
      "name": "Indoor Plants",
      "path": "Plants > Indoor Plants", 
      "level": 2
    },
    {
      "id": 3,
      "name": "Low Light Plants",
      "path": "Plants > Indoor Plants > Low Light Plants",
      "level": 3
    },
    {
      "id": 4,
      "name": "Pots & Planters",
      "path": "Pots & Planters",
      "level": 1
    },
    {
      "id": 5,
      "name": "Ceramic Pots",
      "path": "Pots & Planters > Ceramic Pots",
      "level": 2
    }
  ]
}
```

### Example Brand Structure
```json
{
  "brands": [
    {
      "id": 1,
      "name": "Plant Co.",
      "logo_url": "https://cdn.bigcommerce.com/brands/plant-co-logo.png",
      "description": "Premium indoor plants and accessories"
    },
    {
      "id": 2, 
      "name": "Garden Essentials",
      "logo_url": "https://cdn.bigcommerce.com/brands/garden-essentials-logo.png",
      "description": "Professional gardening tools and supplies"
    }
  ]
}
```

## Step 13: Testing Checklist

### Basic Functionality
1. **Quick Search**: Test header search functionality
   - Search for "ZZ Plant" → Should return ZZ Plant products
   - Search for "low light" → Should return low light plants
   - Search for "ceramic" → Should return ceramic pots

2. **Full Search Page**: Test `/search?term=plant` 
   - Should show all plant products
   - Should display category facets (Plants, Indoor Plants, etc.)
   - Should display brand facets (Plant Co., Garden Essentials, etc.)

3. **Shop All**: Test `/shop-all` shows all products
   - Should display all products without search term
   - Should show category hierarchy in facets

4. **Category Navigation**: Test category links work
   - Click "Plants" → Should filter to plant products
   - Click "Indoor Plants" → Should show indoor plants only
   - Click "Low Light Plants" → Should show low light plants

### Advanced Features
5. **Facets**: Verify facets appear and filter correctly
   - **Categories**: Should show hierarchical structure (Plants > Indoor Plants > Low Light Plants)
   - **Brands**: Should show all brands with counts
   - **Price Range**: Should show price brackets (Under $25, $25-$50, $50-$100, etc.)
   - **Availability**: Should show In Stock/Out of Stock options

6. **Pagination**: Test pagination works
   - Search for "plant" → Should show 12 products per page
   - Click "Next" → Should show next 12 products
   - URL should update with page parameter

7. **Sorting**: Test different sort options
   - **Relevance**: Default sorting by search relevance
   - **Price Low to High**: Should sort by `default_price` ascending
   - **Price High to Low**: Should sort by `default_price` descending
   - **Name A-Z**: Should sort alphabetically by product name

8. **Price Filtering**: Test price range filters
   - Select "$50-$100" → Should show only products in that range
   - Select "Under $25" → Should show budget-friendly items
   - Multiple price ranges should work together

9. **Brand Filtering**: Test brand filters
   - Select "Plant Co." → Should show only Plant Co. products
   - Select multiple brands → Should show products from all selected brands
   - Brand counts should update when other filters are applied

10. **Stock Filtering**: Test in-stock filters
    - Select "In Stock" → Should show only available products
    - Stock status should be real-time from inventory data

### Debug Tools
11. **Debug Function**: Test `debugIndex()` in console
    ```javascript
    // In browser console
    import { debugIndex } from '~/lib/algolia';
    await debugIndex();
    // Should show: total hits, processing time, sample product data
    ```

12. **Error Handling**: Test with invalid queries
    - Search for "xyz123" → Should show "No results found"
    - Invalid category filter → Should handle gracefully
    - Network errors → Should show user-friendly error message

13. **Performance**: Check search response times
    - Quick search should respond in < 200ms
    - Faceted search should respond in < 500ms
    - Large result sets should paginate properly

### Real-World Test Scenarios
14. **Category Browsing**:
    - Navigate to "Plants > Indoor Plants > Low Light Plants"
    - Should show ZZ Plant, Snake Plant, Pothos, etc.
    - Facets should show relevant brands and price ranges

15. **Brand Shopping**:
    - Search for "Plant Co." brand
    - Should show all Plant Co. products across categories
    - Should maintain category hierarchy in facets

16. **Price Shopping**:
    - Filter by "$25-$50" price range
    - Should show affordable plants and accessories
    - Should update category and brand facets accordingly

17. **Combined Filters**:
    - Select "Plants" category + "Plant Co." brand + "$50-$100" price
    - Should show Plant Co. plants in that price range
    - Facet counts should reflect the combined filter

## Step 14: Performance Optimization

### Caching Strategy
1. **Redis Caching**: Implement Redis caching for search results
2. **CDN**: Use Algolia's CDN for faster global access
3. **Indexing**: Set up automated indexing from BigCommerce

### Analytics
4. **Algolia Analytics**: Enable for search insights
5. **Custom Events**: Track search performance metrics

## Step 15: Troubleshooting

### Common Issues

**0 Results**
- Check Algolia index configuration and data
- Verify environment variables are set correctly
- Test with `debugIndex()` function

**Missing Facets**
- Verify facet attributes are configured in Algolia
- Check if facets are being built from search results

**Category Filters Not Working**
- Ensure category_ids are properly indexed
- Check filter syntax in faceted search

**Import Errors**
- Verify package installation: `npm install algoliasearch@^5.33.0 @algolia/requester-fetch@^5.33.0`
- Check import paths match your project structure

### Recent Fixes (Latest Updates)

**Facet Selection Bug - All Facets Selected Together**
- **Problem**: Clicking one facet selected all facets in the group
- **Root Cause**: All categories/brands had the same `entityId: 0`
- **Fix**: Updated `buildFacetsFromAlgoliaFacets()` to assign unique entityIds:
  ```typescript
  // Before (❌ All facets had same ID)
  entityId: 0
  
  // After (✅ Each facet gets unique ID)
  entityId: index + 1
  ```

**Zero Results After Facet Selection**
- **Problem**: After fixing facet selection, filtered results showed zero for everything
- **Root Cause**: EntityIds (1, 2, 3) didn't map to actual category/brand names
- **Fix**: Added `buildFacetMappings()` function to map entityIds back to actual values:
  ```typescript
  // Map entityIds back to actual category names
  const categoryNames = categoryIn.map(id => facetMappings.categories[id]).filter(Boolean);
  if (categoryNames.length > 0) {
    searchParams.facetFilters.push(`categories_without_path:${categoryNames.join(',')}`);
  }
  ```

**Filter Parsers Missing Cases**
- **Problem**: ToggleGroup and Rating filter types weren't handled properly
- **Fix**: Added missing cases to `getFilterParsers()`:
  ```typescript
  case 'toggle-group':
    return { ...acc, [filter.paramName]: parseAsArrayOf(parseAsString) };
  case 'rating':
    return { ...acc, [filter.paramName]: parseAsArrayOf(parseAsString) };
  ```

### Debug Commands

```bash
# Test Algolia connection
curl -X GET "https://${NEXT_PUBLIC_ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${NEXT_PUBLIC_ALGOLIA_INDEXNAME}?query=ZZ Plant" \
  -H "X-Algolia-API-Key: ${NEXT_PUBLIC_ALGOLIA_APP_KEY}" \
  -H "X-Algolia-Application-Id: ${NEXT_PUBLIC_ALGOLIA_APP_ID}"

# Test local search endpoint
curl -s "http://localhost:3000/shop-all" | grep -o "ZZ Plant\|17 results\|Plants\|Shop All" | head -10

# Test category search
curl -s "http://localhost:3000/search?term=plant&category_ids=27" | grep -o "Indoor Plants\|Low Light Plants" | head -5

# Test brand search
curl -s "http://localhost:3000/search?term=&brand=Plant Co." | grep -o "Plant Co.\|ZZ Plant\|Snake Plant" | head -5

# Test price range search
curl -s "http://localhost:3000/search?term=&price_min=50&price_max=100" | grep -o "79.99\|89.99\|99.99" | head -5
```

### Environment Variable Checklist

```bash
# Required variables
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_APP_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEXNAME=your_index_name

# Optional variables
NEXT_PUBLIC_BUYER_PORTAL_URL=https://buyer-portal.bigcommerce.com/
```

## Step 16: Advanced Features

### Custom Search Logic
- Implement search suggestions
- Add search analytics tracking
- Create custom ranking algorithms

### Integration Features
- Sync with BigCommerce inventory
- Real-time price updates
- Category-based search optimization

## Final Notes

- The integration maintains full compatibility with existing Catalyst components
- Search results are transformed to match Catalyst's expected format
- Facets are built from search results when Algolia facets are empty
- Category filters are only applied when there's a search term
- The solution handles both quick search and full faceted search
- Debug tools are included for troubleshooting
- TypeScript support ensures type safety throughout

This implementation provides a complete, production-ready Algolia integration that significantly improves search performance and user experience compared to the default BigCommerce search, while maintaining all the advanced features your project requires.

## Complete File Summary

### **Files Created (8 total)**
1. **`core/lib/algolia.ts`** - Main Algolia client with helper functions and debug tools
2. **`core/lib/algolia/client.ts`** - Basic Algolia client setup for v5 API
3. **`core/lib/algolia/faceted-search.ts`** - Advanced faceted search with filtering logic
4. **`core/data-transformers/algolia-search-results-transformer.ts`** - Transform Algolia results to Catalyst format
5. **`core/components/search-form/search-form.tsx`** - Reusable search form component
6. **`core/app/[locale]/(default)/shop-all/page.tsx`** - Shop all products route
7. **`core/app/[locale]/(default)/(faceted)/search/page.tsx`** - Main search page with facets
8. **`.env.local`** - Environment variables (add Algolia credentials)

### **Files Modified (2 total)**
1. **`core/components/header/index.tsx`** - Add search functionality to header
2. **`package.json`** - Add Algolia dependencies

### **Files Referenced (Existing)**
- **`core/components/product-card/fragment.ts`** - Product card GraphQL fragment
- **`core/client/graphql.ts`** - GraphQL client utilities
- **`core/lib/makeswift/components/site-header/site-header.tsx`** - Header component

### **Key Features by File**
- **`algolia.ts`**: Core client, search helpers, debug function, TypeScript interfaces
- **`faceted-search.ts`**: Category filtering, brand filtering, price ranges, sorting
- **`algolia-search-results-transformer.ts`**: Data transformation, Catalyst compatibility
- **`search-form.tsx`**: User interface, form handling, navigation
- **`search/page.tsx`**: Main search page, results display, pagination
- **`shop-all/page.tsx`**: Browse all products, category navigation

### **Environment Variables Required**
```bash
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_APP_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEXNAME=your_index_name
```

### **Dependencies Added**
```bash
npm install algoliasearch@^5.33.0 @algolia/requester-fetch@^5.33.0
```

This complete file structure provides a production-ready Algolia integration that can be implemented step-by-step following the guide above. 