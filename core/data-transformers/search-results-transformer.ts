import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { ProductCardFragment } from '~/components/product-card/fragment';

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
): Promise<Array<ResultOf<typeof ProductCardFragment>>> => {
  const format = await getFormatter();

  // Debug: Log the first hit to see the actual structure
  if (hits.length > 0) {
    console.log('🔍 [Algolia] First hit structure:', JSON.stringify(hits[0], null, 2));
  }

  return hits.map((hit) => {
    const selectedCurrency = 'USD';
    
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
    
    // Debug: Log the extracted price
    if (hits.indexOf(hit) === 0) {
      console.log('🔍 [Algolia] Extracted price:', {
        objectID: hit.objectID,
        priceValue,
        default_price: hit.default_price,
        prices: hit.prices,
        calculated_prices: hit.calculated_prices,
        retail_prices: hit.retail_prices
      });
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
