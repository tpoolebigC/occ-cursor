import { algoliasearch } from 'algoliasearch';
import { createFetchRequester } from '@algolia/requester-fetch';

console.log('🔍 [Algolia] Environment check:', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'SET' : 'NOT SET',
  appKey: process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY ? 'SET' : 'NOT SET',
  nodeEnv: process.env.NODE_ENV
});

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is required');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_KEY is not set');
}

const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY,
  { requester: createFetchRequester() }
);

export default algoliaClient; 