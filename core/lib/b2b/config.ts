import { z } from 'zod';

/**
 * B2B API Configuration
 * 
 * Authentication updated per B2B Edition docs (Sept 2025):
 * Server-to-server requests now use X-Auth-Token + X-Store-Hash.
 * See: https://developer.bigcommerce.com/b2b-edition/docs/authentication
 */

// B2B API Configuration Schema
const B2BConfigSchema = z.object({
  // BigCommerce Store Configuration
  BIGCOMMERCE_STORE_HASH: z.string().min(1),
  BIGCOMMERCE_CHANNEL_ID: z.string().min(1),
  
  // B2B Server-to-Server Auth (new standard - Sept 2025)
  // V3 API token with B2B Edition scope set to "modify"
  B2B_X_AUTH_TOKEN: z.string().optional(),
  
  // BC Management API token (for V2/V3 endpoints like external_order_id)
  BIGCOMMERCE_ACCESS_TOKEN: z.string().optional(),
  
  // B2B API Endpoints
  B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com'),
  B2B_STOREFRONT_API_HOST: z.string().default('https://api.bigcommerce.com'),
  
  // Algolia Configuration
  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_SEARCH_KEY: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),
  ALGOLIA_INDEX_NAME: z.string().optional(),
  
  // Search Provider Configuration
  SEARCH_PROVIDER: z.enum(['bigcommerce', 'algolia', 'searchspring', 'custom']).default('bigcommerce'),
  
  // Feature Flags
  ENABLE_B2B_API: z.boolean().default(true),
  ENABLE_ALGOLIA_SEARCH: z.boolean().default(true),
  ENABLE_COMPANY_CATALOG_FILTER: z.boolean().default(false),
  ENABLE_CUSTOM_B2B_PAGES: z.boolean().default(true),
});

// Parse and validate environment variables
export const b2bConfig = B2BConfigSchema.parse({
  BIGCOMMERCE_STORE_HASH: process.env.BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CHANNEL_ID: process.env.BIGCOMMERCE_CHANNEL_ID,
  B2B_X_AUTH_TOKEN: process.env.B2B_X_AUTH_TOKEN,
  BIGCOMMERCE_ACCESS_TOKEN: process.env.BIGCOMMERCE_ACCESS_TOKEN,
  B2B_API_HOST: process.env.B2B_API_HOST,
  B2B_STOREFRONT_API_HOST: process.env.B2B_STOREFRONT_API_HOST,
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY,
  ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY,
  ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,
  SEARCH_PROVIDER: process.env.SEARCH_PROVIDER || 'bigcommerce',
  ENABLE_B2B_API: process.env.ENABLE_B2B_API !== 'false',
  ENABLE_ALGOLIA_SEARCH: process.env.ENABLE_ALGOLIA_SEARCH !== 'false',
  ENABLE_COMPANY_CATALOG_FILTER: process.env.ENABLE_COMPANY_CATALOG_FILTER === 'true',
  ENABLE_CUSTOM_B2B_PAGES: process.env.ENABLE_CUSTOM_B2B_PAGES !== 'false',
});

// B2B API Client Configuration
export const b2bApiConfig = {
  baseUrl: b2bConfig.B2B_API_HOST,
  storefrontBaseUrl: b2bConfig.B2B_STOREFRONT_API_HOST,
  storeHash: b2bConfig.BIGCOMMERCE_STORE_HASH,
  channelId: b2bConfig.BIGCOMMERCE_CHANNEL_ID,
  xAuthToken: b2bConfig.B2B_X_AUTH_TOKEN,
  bcAccessToken: b2bConfig.BIGCOMMERCE_ACCESS_TOKEN,
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

// Search Configuration
export const searchConfig = {
  provider: b2bConfig.SEARCH_PROVIDER,
  enableCompanyCatalogFilter: b2bConfig.ENABLE_COMPANY_CATALOG_FILTER,
};

// Feature Flags
export const featureFlags = {
  enableB2BApi: b2bConfig.ENABLE_B2B_API,
  enableAlgoliaSearch: b2bConfig.ENABLE_ALGOLIA_SEARCH,
  enableCompanyCatalogFilter: b2bConfig.ENABLE_COMPANY_CATALOG_FILTER,
  enableCustomB2BPages: b2bConfig.ENABLE_CUSTOM_B2B_PAGES,
};

// Helper function to check if B2B API is properly configured
export function isB2BApiConfigured(): boolean {
  return !!(
    b2bConfig.BIGCOMMERCE_STORE_HASH &&
    b2bConfig.BIGCOMMERCE_CHANNEL_ID
  );
}

// Helper function to check if B2B server-to-server auth is configured
export function hasB2BServerAuth(): boolean {
  return !!(
    b2bConfig.B2B_X_AUTH_TOKEN &&
    b2bConfig.BIGCOMMERCE_STORE_HASH
  );
}

// Helper function to check if BC Management API is configured
export function hasBCManagementAuth(): boolean {
  return !!(
    b2bConfig.BIGCOMMERCE_ACCESS_TOKEN &&
    b2bConfig.BIGCOMMERCE_STORE_HASH
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

// Helper function to check if SearchSpring is configured
export function isSearchSpringConfigured(): boolean {
  // TODO: Add SearchSpring env vars when implemented
  return false;
} 