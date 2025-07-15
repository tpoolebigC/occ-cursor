import { getFormatter, getTranslations } from 'next-intl/server';
import { ResultOf } from 'gql.tada';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { ProductCardFragment } from '~/components/product-card/fragment';

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
  default_price: string;
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
        src: product.defaultImage.url,
        alt: product.defaultImage.altText,
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