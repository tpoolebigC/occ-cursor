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

    const products: QuickSearchProduct[] = algoliaResults.hits.map((hit: AlgoliaHit) => ({
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
          value: hit.calculated_prices?.[selectedCurrency] || hit.prices?.[selectedCurrency] || 0,
          currencyCode: selectedCurrency,
        },
        basePrice: {
          value: parseInt(hit.default_price, 10) || 0,
          currencyCode: selectedCurrency,
        },
        retailPrice: {
          value: hit.retail_prices?.[selectedCurrency] || 0,
          currencyCode: selectedCurrency,
        },
        salePrice: {
          value: hit.sales_prices?.[selectedCurrency] && hit.sales_prices[selectedCurrency] > 0
            ? hit.sales_prices[selectedCurrency]
            : parseInt(hit.default_price, 10) || 0,
          currencyCode: selectedCurrency,
        },
        priceRange: {
          min: {
            value: hit.prices?.[selectedCurrency] || 0,
            currencyCode: selectedCurrency,
          },
          max: {
            value: hit.prices?.[selectedCurrency] || 0,
            currencyCode: selectedCurrency,
          },
        },
      },
    }));

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
