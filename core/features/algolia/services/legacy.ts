import { algoliasearch } from 'algoliasearch';
import { createFetchRequester } from '@algolia/requester-fetch';

const appId = process.env.ALGOLIA_APPLICATION_ID;
const searchApiKey = process.env.ALGOLIA_SEARCH_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || 'products';

if (!appId || !searchApiKey) {
  throw new Error('Missing Algolia environment variables: ALGOLIA_APPLICATION_ID and ALGOLIA_SEARCH_API_KEY are required');
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
  
  const firstResult = results.results[0];
  if (!firstResult || 'hits' in firstResult === false) {
    throw new Error('Invalid search result');
  }
  
  return firstResult as unknown as {
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
    facets?: string[];
    facetFilters?: string[][];
    numericFilters?: string[];
    filters?: string;
    [key: string]: any;
  };
}) => {
  const results = await algoliaClient.search([{
    indexName: searchIndexName,
    ...searchParams
  }]);
  
  const firstResult = results.results[0];
  if (!firstResult || 'hits' in firstResult === false) {
    throw new Error('Invalid search result');
  }
  
  return firstResult as unknown as {
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

// Debug function to inspect index
export const debugIndex = async () => {
  try {
    console.log('🔍 [Algolia Debug] Starting index inspection...');
    
    const searchResult = await algoliaClient.search([{
      indexName,
      hitsPerPage: 5
    } as any]);
    
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

// Export the index name for use in other files
export { indexName };

// Export types for better TypeScript support
export interface AlgoliaHit {
  objectID: string;
  name: string;
  url: string;
  product_images: Array<{
    description: string;
    is_thumbnail: boolean;
    url_thumbnail: string;
  }>;
  categories_without_path: string[];
  default_price: string | number;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  calculated_prices: Record<string, number>;
  retail_prices: Record<string, number>;
  brand_name?: string;
  categories?: {
    lvl0: string[];
  };
} 