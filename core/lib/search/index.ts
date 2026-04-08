/**
 * Search Provider Module
 *
 * Exports the search provider interface and a factory to get the
 * configured provider. The active provider is determined by the
 * SEARCH_PROVIDER environment variable.
 */

export * from './types';
export { getSearchProvider } from './provider-factory';
