import { getFormatter } from 'next-intl/server';

interface AlgoliaProduct {
  objectID: string;
  name: string;
  path: string;
  brand?: {
    name: string;
  };
  defaultImage?: {
    url: string;
    altText: string;
  };
  prices?: {
    [currency: string]: number;
  };
  entityId: number;
  [key: string]: any;
}

export async function transformAlgoliaResults(hits: AlgoliaProduct[]) {
  const format = await getFormatter();

  return hits.map((hit) => {
    // Extract price from the simple Algolia format
    const priceValue = hit.prices?.USD || hit.prices?.price || 0;
    
    const transformedProduct = {
      entityId: hit.entityId || parseInt(hit.objectID),
      name: hit.name,
      path: hit.path,
      brand: hit.brand ? { name: hit.brand.name } : null,
      defaultImage: hit.defaultImage ? {
        url: hit.defaultImage.url,
        altText: hit.defaultImage.altText || hit.name,
      } : null,
      prices: {
        price: {
          value: priceValue,
          currencyCode: 'USD',
        },
        priceRange: {
          min: {
            value: priceValue,
            currencyCode: 'USD',
          },
          max: {
            value: priceValue,
            currencyCode: 'USD',
          },
        },
        basePrice: {
          value: priceValue,
          currencyCode: 'USD',
        },
        salePrice: null,
      },
      // Add any other fields that might be needed
      ...hit,
    };

    // Debug: Log the first product's prices structure
    if (hits.indexOf(hit) === 0) {
      console.log('🔍 [Algolia] First product prices structure:', JSON.stringify(transformedProduct.prices, null, 2));
    }

    return transformedProduct;
  });
} 