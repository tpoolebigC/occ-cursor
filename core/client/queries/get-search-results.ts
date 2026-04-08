import { cache } from 'react';
import { ResultOf } from 'gql.tada';

import { ProductCardFragment } from '~/components/product-card/fragment';

// Lazy-import Algolia to avoid crashing when Algolia env vars are not set
type AlgoliaHit = {
  objectID: string;
  name: string;
  url: string;
  product_images: Array<{ description: string; is_thumbnail: boolean; url_thumbnail: string }>;
  categories_without_path: string[];
  default_price: string | number;
  prices: Record<string, any>;
  sales_prices: Record<string, number>;
  calculated_prices: Record<string, number>;
  retail_prices: Record<string, number>;
  brand_name?: string;
  categories?: { lvl0: string[] };
};

interface ProductSearchResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  exhaustiveTypo: boolean;
  exhaustive: {
    nbHits: boolean;
    typo: boolean;
  };
  query: string;
  params: string;
  renderingContent: Record<string, unknown>;
  processingTimeMS: number;
  processingTimingsMS: {
    _request: {
      roundTrip: number;
    };
    afterFetch: {
      format: {
        total: number;
      };
    };
    getIdx: {
      load: {
        total: number;
      };
      total: number;
    };
    total: number;
  };
  serverTimeMS: number;
}

interface QuickSearchProduct {
  entityId: string;
  name: string;
  path: string;
  defaultImage: ResultOf<typeof ProductCardFragment>['defaultImage'];
  categories: {
    edges: {
      node: {
        name: string;
        path: string;
      };
    }[];
  };
  brand: ResultOf<typeof ProductCardFragment>['brand'];
  reviewSummary: null;
  prices: {
    price: {
      value: number;
      currencyCode: string;
    };
    basePrice: {
      value: number;
      currencyCode: string;
    };
    retailPrice: {
      value: number;
      currencyCode: string;
    };
    salePrice: {
      value: number;
      currencyCode: string;
    };
    priceRange: {
      min: {
        value: number;
        currencyCode: string;
      };
      max: {
        value: number;
        currencyCode: string;
      };
    };
  };
}

export const getSearchResults = cache(async (searchTerm: string) => {
  const selectedCurrency = 'USD'; // TODO: use selected storefront currency

  try {
    // Lazy-import Algolia to avoid crashing when env vars are missing
    const { searchSingleIndex } = await import('~/features/algolia/services/legacy');

    const algoliaResults = await searchSingleIndex<AlgoliaHit>({
              indexName: process.env.ALGOLIA_INDEX_NAME || '',
      searchParams: {
        query: searchTerm,
        hitsPerPage: 5,
      },
    });

    const products: QuickSearchProduct[] = algoliaResults.hits.map((hit: AlgoliaHit) => {
      // Fix price extraction - handle different possible price structures
      let priceValue = 0;
      
      // Try different price fields in order of preference
      if (hit.default_price !== undefined && hit.default_price !== null) {
        // Handle both string and number types
        priceValue = typeof hit.default_price === 'string' 
          ? parseFloat(hit.default_price) || 0
          : Number(hit.default_price) || 0;
      } else if (hit.prices && typeof hit.prices === 'object' && hit.prices.price && typeof hit.prices.price === 'object' && 'value' in hit.prices.price) {
        // Handle the actual data structure: prices.price.value
        priceValue = Number((hit.prices.price as any).value) || 0;
      } else if (hit.prices && typeof hit.prices === 'object' && hit.prices[selectedCurrency]) {
        priceValue = Number(hit.prices[selectedCurrency]) || 0;
      } else if (hit.calculated_prices && typeof hit.calculated_prices === 'object' && hit.calculated_prices[selectedCurrency]) {
        priceValue = Number(hit.calculated_prices[selectedCurrency]) || 0;
      } else if (hit.retail_prices && typeof hit.retail_prices === 'object' && hit.retail_prices[selectedCurrency]) {
        priceValue = Number(hit.retail_prices[selectedCurrency]) || 0;
      }
      
      // Ensure we have a valid price
      if (isNaN(priceValue) || priceValue <= 0) {
        const productId = hit.objectID || 'unknown';
        console.warn(`⚠️ [Algolia] Invalid price for product ${productId}:`, priceValue);
        priceValue = 0;
      }

      return {
        entityId: hit.objectID,
        name: hit.name,
        path: hit.url,
        defaultImage: {
          altText: hit.product_images.find((img) => img.is_thumbnail)?.description || '',
          url: hit.product_images.find((img) => img.is_thumbnail)?.url_thumbnail || '',
        },
        categories: {
          edges: (hit.categories?.lvl0 || hit.categories_without_path || []).map((categoryName) => ({
            node: {
              name: categoryName,
              path: `/${categoryName.replaceAll(' ', '-').toLowerCase()}`,
            },
          })),
        },
        brand: {
          name: hit.brand_name || '',
          path: hit.brand_name ? `/${hit.brand_name.replaceAll(' ', '-').toLowerCase()}` : '',
        },
        reviewSummary: null,
        prices: {
          price: {
            value: priceValue,
            currencyCode: selectedCurrency,
          },
          basePrice: {
            value: priceValue,
            currencyCode: selectedCurrency,
          },
          retailPrice: {
            value: priceValue,
            currencyCode: selectedCurrency,
          },
          salePrice: {
            value: priceValue,
            currencyCode: selectedCurrency,
          },
          priceRange: {
            min: {
              value: priceValue,
              currencyCode: selectedCurrency,
            },
            max: {
              value: priceValue,
              currencyCode: selectedCurrency,
            },
          },
        },
      };
    });

    return {
      status: 'success',
      data: {
        products,
      },
    };
  } catch (error: unknown) {
    console.error('Error during Algolia search:', error);
    
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});
