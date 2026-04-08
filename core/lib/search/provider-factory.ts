import type { SearchProvider, SearchProviderName } from './types';

let cachedProvider: SearchProvider | null = null;
let cachedProviderName: SearchProviderName | null = null;

/**
 * Get the configured search provider.
 * Lazy-loads the appropriate provider module based on SEARCH_PROVIDER env var.
 * Caches the instance for reuse within the same server process.
 */
export async function getSearchProvider(): Promise<SearchProvider> {
  const providerName = (process.env.SEARCH_PROVIDER || 'bigcommerce') as SearchProviderName;

  // Return cached provider if it matches
  if (cachedProvider && cachedProviderName === providerName) {
    return cachedProvider;
  }

  let provider: SearchProvider;

  switch (providerName) {
    case 'algolia': {
      const { AlgoliaSearchProvider } = await import('./providers/algolia-provider');
      provider = new AlgoliaSearchProvider();
      break;
    }

    case 'searchspring': {
      // Placeholder for future SearchSpring implementation
      console.warn('SearchSpring provider not yet implemented. Falling back to BigCommerce.');
      const { BigCommerceSearchProvider } = await import('./providers/bigcommerce-provider');
      provider = new BigCommerceSearchProvider();
      break;
    }

    case 'custom': {
      // Placeholder for custom provider
      console.warn('Custom search provider not configured. Falling back to BigCommerce.');
      const { BigCommerceSearchProvider } = await import('./providers/bigcommerce-provider');
      provider = new BigCommerceSearchProvider();
      break;
    }

    case 'bigcommerce':
    default: {
      const { BigCommerceSearchProvider } = await import('./providers/bigcommerce-provider');
      provider = new BigCommerceSearchProvider();
      break;
    }
  }

  // Verify the provider is configured
  if (!provider.isConfigured()) {
    console.warn(
      `Search provider "${providerName}" is not fully configured. ` +
        'Check your environment variables. Falling back to BigCommerce.',
    );

    if (providerName !== 'bigcommerce') {
      const { BigCommerceSearchProvider } = await import('./providers/bigcommerce-provider');
      provider = new BigCommerceSearchProvider();
    }
  }

  cachedProvider = provider;
  cachedProviderName = providerName;

  return provider;
}
