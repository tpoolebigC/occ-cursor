import { getFormatter, getTranslations } from 'next-intl/server';

import { SearchResult } from '@/vibes/soul/primitives/navigation';

import { pricesTransformer } from './prices-transformer';

// Define the AlgoliaHit type returned by the Algolia API via the algoliaClient
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
  default_price: string;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  calculated_prices: Record<string, number>;
  retail_prices: Record<string, number>;
}

// Implement the algoliaResultsTransformer function
export async function algoliaResultsTransformer(
  hits: AlgoliaHit[]
): Promise<SearchResult[]> {
  // Get the formatter and translations for the current locale
  const format = await getFormatter();
  const t = await getTranslations('Components.Header.Search');

  // Transform the Algolia hits into SearchResult objects
  const products = hits.map((hit) => {
    const price = pricesTransformer(
      {
        price: {
          value: hit.calculated_prices.USD ?? 0,
          currencyCode: 'USD',
        },
        basePrice: {
          value: parseInt(hit.default_price, 10),
          currencyCode: 'USD',
        },
        retailPrice: {
          value: hit.retail_prices.USD ?? 0,
          currencyCode: 'USD',
        },
        salePrice: {
          value:
            hit.sales_prices.USD && hit.sales_prices.USD > 0
              ? hit.sales_prices.USD
              : parseInt(hit.default_price, 10),
          currencyCode: 'USD',
        },
        priceRange: {
          min: {
            value: hit.prices.USD ?? 0,
            currencyCode: 'USD',
          },
          max: {
            value: hit.prices.USD ?? 0,
            currencyCode: 'USD',
          },
        },
      },
      format
    );

    return {
      id: hit.objectID,
      title: hit.name,
      href: hit.url,
      price,
      image: {
        src:
          hit.product_images.find((image) => image.is_thumbnail)
            ?.url_thumbnail ?? '',
        alt: hit.product_images[0]?.description ?? '',
      },
    };
  });

  // Create the product results SearchResult object
  const productResults: SearchResult = {
    type: 'products',
    title: t('products'),
    products,
  };

  // For the returned product results, create a unique list of categories.
  // For example, if you had two products, one with categories ['Electronics',
  // 'Computers'] and another with ['Electronics', 'Cameras'], this step would
  // produce ['Electronics', 'Computers', 'Cameras'].
  const uniqueCategories = Array.from(
    new Set(hits.flatMap((product) => product.categories_without_path))
  );

  // Create the category results SearchResult object
  const categoryResults: SearchResult = {
    type: 'links',
    title: t('categories'),
    links: uniqueCategories.map((category) => {
      return {
        label: category,
        href: `/${category.toLowerCase().replace(/\s+/g, '-')}`,
      };
    }),
  };

  // Create an array to hold the final results
  const results = [];

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

// Keep the original transformer for backward compatibility
export const searchResultsTransformer = async (
  hits: Array<{
    objectID: string;
    name: string;
    path?: string;
    url?: string;
    brand?: {
      name: string;
    };
    defaultImage?: {
      url: string;
      altText: string;
    };
    product_images?: Array<{
      description: string;
      is_thumbnail: boolean;
      url_thumbnail: string;
    }>;
    variants?: Array<{
      image_url?: string;
    }>;
    prices?: Record<string, number>;
    sales_prices?: Record<string, number>;
    calculated_prices?: Record<string, number>;
    retail_prices?: Record<string, number>;
    default_price?: string | number;
    entityId: number;
  }>,
): Promise<any[]> => {
  const format = await getFormatter();

  return hits.map((hit) => {
    const selectedCurrency = 'USD';
    
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
      const productId = hit.objectID || hit.entityId || 'unknown';
      console.warn(`⚠️ [Algolia] Invalid price for product ${productId}:`, priceValue);
      priceValue = 0;
    }
    
    return {
      entityId: hit.entityId || parseInt(hit.objectID),
      name: hit.name,
      path: hit.path || hit.url || `/product/${hit.objectID}`,
      brand: hit.brand ? { name: hit.brand.name } : null,
      defaultImage: hit.defaultImage ? {
        url: hit.defaultImage.url,
        altText: hit.defaultImage.altText || hit.name,
      } : hit.product_images && hit.product_images.length > 0 ? {
        url: hit.product_images.find(img => img.is_thumbnail)?.url_thumbnail || hit.product_images[0].url_thumbnail,
        altText: hit.product_images.find(img => img.is_thumbnail)?.description || hit.product_images[0].description || hit.name,
      } : hit.variants && hit.variants.length > 0 && hit.variants[0].image_url ? {
        url: hit.variants[0].image_url,
        altText: hit.name,
      } : null,
      prices: {
        price: {
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
        basePrice: {
          value: priceValue,
          currencyCode: selectedCurrency,
        },
        salePrice: null,
      },
    };
  });
};
