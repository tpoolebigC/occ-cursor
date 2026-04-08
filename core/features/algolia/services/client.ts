import { algoliasearch } from 'algoliasearch';

const appId = process.env.ALGOLIA_APPLICATION_ID;
const searchApiKey = process.env.ALGOLIA_SEARCH_API_KEY;

// Gracefully handle missing Algolia config
if (!appId || !searchApiKey) {
  console.warn(
    '[Algolia] ALGOLIA_APPLICATION_ID and/or ALGOLIA_SEARCH_API_KEY not set. ' +
    'Algolia features will be disabled.'
  );
}

const algoliaClient = (appId && searchApiKey)
  ? algoliasearch(appId, searchApiKey)
  : null;

export default algoliaClient;

// Re-export searchSingleIndex from legacy service (Algolia v5 compatible)
export { searchSingleIndex } from './legacy'; 