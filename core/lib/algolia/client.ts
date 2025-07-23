import { algoliasearch } from 'algoliasearch';

console.log('🔍 [Algolia] Environment check:', {
  appId: process.env.ALGOLIA_APPLICATION_ID ? 'SET' : 'NOT SET',
  appKey: process.env.ALGOLIA_SEARCH_API_KEY ? 'SET' : 'NOT SET',
  indexName: process.env.ALGOLIA_INDEX_NAME ? 'SET' : 'NOT SET',
  nodeEnv: process.env.NODE_ENV
});

if (!process.env.ALGOLIA_APPLICATION_ID) {
  throw new Error('ALGOLIA_APPLICATION_ID is required');
}

if (!process.env.ALGOLIA_SEARCH_API_KEY) {
  throw new Error('ALGOLIA_SEARCH_API_KEY is not set');
}

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_SEARCH_API_KEY
);

export default algoliaClient; 