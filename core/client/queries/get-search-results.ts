import { cache } from 'react';
import { ResultOf } from 'gql.tada';

import { ProductCardFragment } from '~/components/product-card/fragment';
import { AlgoliaHit } from '~/data-transformers/algolia-search-results-transformer';
import algoliaClient from '~/lib/algolia/client';

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
    const algoliaResults = await algoliaClient.searchSingleIndex<AlgoliaHit>({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME || '',
      searchParams: {
        query: searchTerm,
        hitsPerPage: 5,
      },
    });

    const products: QuickSearchProduct[] = algoliaResults.hits.map((hit: AlgoliaHit) => {
      // Fix price extraction - handle different possible price structures
      let priceValue = 0;
      
      // Try different price fields in order of preference
      if (hit.default_price) {
        // Handle both string and number types
        priceValue = typeof hit.default_price === 'string' 
          ? parseFloat(hit.default_price) || 0
          : hit.default_price;
      } else if (hit.prices && hit.prices[selectedCurrency]) {
        priceValue = hit.prices[selectedCurrency];
      } else if (hit.calculated_prices && hit.calculated_prices[selectedCurrency]) {
        priceValue = hit.calculated_prices[selectedCurrency];
      } else if (hit.retail_prices && hit.retail_prices[selectedCurrency]) {
        priceValue = hit.retail_prices[selectedCurrency];
      }
      
      // Ensure we have a valid price
      if (isNaN(priceValue) || priceValue <= 0) {
        console.warn(`⚠️ [Algolia] Invalid price for product ${hit.objectID}:`, priceValue);
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
