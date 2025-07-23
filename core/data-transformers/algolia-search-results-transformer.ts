import { getFormatter } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

import { ResultOf } from 'gql.tada';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { PricingFragment } from '~/client/fragments/pricing';

import { pricesTransformer } from './prices-transformer';

// Define the AlgoliaHit type returned by the Algolia API
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

// Define the interface for products that match Catalyst's expected format
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
  prices: ResultOf<typeof PricingFragment>['prices'];
}

// Transform Algolia hits into SearchResult objects
export async function algoliaResultsTransformer(
  hits: AlgoliaHit[]
): Promise<SearchResult[]> {
  const format = await getFormatter();
  const t = await getTranslations('Components.Header.Search');

  // Transform the Algolia hits into QuickSearchProduct objects
  const products: QuickSearchProduct[] = hits.map((hit) => {
    const selectedCurrency = 'USD'; // TODO: use selected storefront currency

    // Fix price extraction - handle different possible price structures
    let priceValue = 0;
    
    // Try different price fields in order of preference
    if (hit.default_price !== undefined && hit.default_price !== null) {
      // Handle both string and number types
      priceValue = typeof hit.default_price === 'string' 
        ? parseFloat(hit.default_price) || 0
        : Number(hit.default_price) || 0;
    } else if (hit.prices && typeof hit.prices === 'object' && hit.prices.price && hit.prices.price.value) {
      // Handle the actual data structure: prices.price.value
      priceValue = Number(hit.prices.price.value) || 0;
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

  // Create the product results SearchResult object
  const productResults: SearchResult = {
    type: 'products',
    title: t('products'),
    products: products.map((product) => ({
      id: product.entityId,
      title: product.name,
      href: product.path,
      price: pricesTransformer(product.prices, format),
      image: {
        src: product.defaultImage?.url || '',
        alt: product.defaultImage?.altText || '',
      },
    })),
  };

  // Create a unique list of categories from the search results
  const uniqueCategories = Array.from(
    new Set(hits.flatMap((product) => product.categories_without_path))
  );

  // Create the category results SearchResult object
  const categoryResults: SearchResult = {
    type: 'links',
    title: t('categories'),
    links: uniqueCategories.map((category) => ({
      label: category,
      href: `/${category.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  };

  // Create an array to hold the final results
  const results: SearchResult[] = [];

  // If there are any categories, add them to the results
  if (categoryResults.links.length > 0) {
    results.push(categoryResults);
  }

  // If there are any products, add them to the results
  if (products.length > 0) {
    results.push(productResults);
  }

  return results;
}

// Transform Algolia hits into Catalyst product format
export function transformAlgoliaSearchResults(
  hits: AlgoliaHit[],
  currencyCode: string = 'USD'
): QuickSearchProduct[] {
  return hits.map((hit) => {
    // Fix price extraction - handle different possible price structures
    let priceValue = 0;
    
    // Try different price fields in order of preference
    if (hit.default_price !== undefined && hit.default_price !== null) {
      // Handle both string and number types
      priceValue = typeof hit.default_price === 'string' 
        ? parseFloat(hit.default_price) || 0
        : Number(hit.default_price) || 0;
    } else if (hit.prices && typeof hit.prices === 'object' && hit.prices.price && hit.prices.price.value) {
      // Handle the actual data structure: prices.price.value
      priceValue = Number(hit.prices.price.value) || 0;
    } else if (hit.prices && typeof hit.prices === 'object' && hit.prices[currencyCode]) {
      priceValue = Number(hit.prices[currencyCode]) || 0;
    } else if (hit.calculated_prices && typeof hit.calculated_prices === 'object' && hit.calculated_prices[currencyCode]) {
      priceValue = Number(hit.calculated_prices[currencyCode]) || 0;
    } else if (hit.retail_prices && typeof hit.retail_prices === 'object' && hit.retail_prices[currencyCode]) {
      priceValue = Number(hit.retail_prices[currencyCode]) || 0;
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
          currencyCode: currencyCode,
        },
        basePrice: {
          value: priceValue,
          currencyCode: currencyCode,
        },
        retailPrice: {
          value: priceValue,
          currencyCode: currencyCode,
        },
        salePrice: {
          value: priceValue,
          currencyCode: currencyCode,
        },
        priceRange: {
          min: {
            value: priceValue,
            currencyCode: currencyCode,
          },
          max: {
            value: priceValue,
            currencyCode: currencyCode,
          },
        },
      },
    };
  });
} 