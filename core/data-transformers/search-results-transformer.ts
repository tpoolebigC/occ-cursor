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
    default_price?: string;
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
    // Handle nested price structure from Algolia
    const priceValue = hit.calculated_prices?.[selectedCurrency]?.value || 
                      hit.prices?.[selectedCurrency]?.value || 
                      hit.default_price?.value || 
                      0;
    
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
          value: hit.retail_prices?.[selectedCurrency]?.value || priceValue,
          currencyCode: selectedCurrency,
        },
        salePrice: hit.sales_prices?.[selectedCurrency]?.value && hit.sales_prices[selectedCurrency].value > 0 ? {
          value: hit.sales_prices[selectedCurrency].value,
          currencyCode: selectedCurrency,
        } : null,
      },
    };
  });
};
