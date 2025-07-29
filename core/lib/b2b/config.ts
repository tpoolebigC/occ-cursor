import { z } from 'zod';

// B2B API Configuration Schema
const B2BConfigSchema = z.object({
  // BigCommerce Store Configuration
  BIGCOMMERCE_STORE_HASH: z.string().min(1),
  BIGCOMMERCE_CHANNEL_ID: z.string().min(1),
  
  // B2B API Credentials (for embedded portal)
  B2B_CLIENT_ID: z.string().optional(),
  B2B_CLIENT_SECRET: z.string().optional(),
  B2B_API_TOKEN: z.string().optional(),
  
  // B2B API Endpoints
  B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com'),
  B2B_STOREFRONT_API_HOST: z.string().default('https://api.bigcommerce.com'),
  
  // Algolia Configuration
  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_SEARCH_KEY: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),
  ALGOLIA_INDEX_NAME: z.string().optional(),
  
  // Feature Flags
  ENABLE_B2B_API: z.boolean().default(true),
  ENABLE_ALGOLIA_SEARCH: z.boolean().default(true),
});

// Parse and validate environment variables
export const b2bConfig = B2BConfigSchema.parse({
  BIGCOMMERCE_STORE_HASH: process.env.BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CHANNEL_ID: process.env.BIGCOMMERCE_CHANNEL_ID,
  B2B_CLIENT_ID: process.env.B2B_CLIENT_ID,
  B2B_CLIENT_SECRET: process.env.B2B_CLIENT_SECRET,
  B2B_API_TOKEN: process.env.B2B_API_TOKEN,
  B2B_API_HOST: process.env.B2B_API_HOST,
  B2B_STOREFRONT_API_HOST: process.env.B2B_STOREFRONT_API_HOST,
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY,
  ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY,
  ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,
  ENABLE_B2B_API: process.env.ENABLE_B2B_API !== 'false',
  ENABLE_ALGOLIA_SEARCH: process.env.ENABLE_ALGOLIA_SEARCH !== 'false',
});

// B2B API Client Configuration
export const b2bApiConfig = {
  baseUrl: b2bConfig.B2B_API_HOST,
  storefrontBaseUrl: b2bConfig.B2B_STOREFRONT_API_HOST,
  storeHash: b2bConfig.BIGCOMMERCE_STORE_HASH,
  channelId: b2bConfig.BIGCOMMERCE_CHANNEL_ID,
  clientId: b2bConfig.B2B_CLIENT_ID,
  clientSecret: b2bConfig.B2B_CLIENT_SECRET,
  apiToken: b2bConfig.B2B_API_TOKEN,
  isEnabled: b2bConfig.ENABLE_B2B_API,
};

// Algolia Configuration
export const algoliaConfig = {
  appId: b2bConfig.ALGOLIA_APP_ID,
  searchKey: b2bConfig.ALGOLIA_SEARCH_KEY,
  adminKey: b2bConfig.ALGOLIA_ADMIN_KEY,
  indexName: b2bConfig.ALGOLIA_INDEX_NAME,
  isEnabled: b2bConfig.ENABLE_ALGOLIA_SEARCH,
};

// Feature Flags
export const featureFlags = {
  enableB2BApi: b2bConfig.ENABLE_B2B_API,
  enableAlgoliaSearch: b2bConfig.ENABLE_ALGOLIA_SEARCH,
};

// Helper function to check if B2B API is properly configured
export function isB2BApiConfigured(): boolean {
  return !!(
    b2bConfig.BIGCOMMERCE_STORE_HASH &&
    b2bConfig.BIGCOMMERCE_CHANNEL_ID
  );
}

// Helper function to check if B2B API credentials are available (optional)
export function hasB2BApiCredentials(): boolean {
  return !!(
    b2bConfig.B2B_CLIENT_ID ||
    b2bConfig.B2B_API_TOKEN
  );
}

// Helper function to check if Algolia is properly configured
export function isAlgoliaConfigured(): boolean {
  return !!(
    b2bConfig.ALGOLIA_APP_ID &&
    b2bConfig.ALGOLIA_SEARCH_KEY &&
    b2bConfig.ALGOLIA_INDEX_NAME
  );
} 