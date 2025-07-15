import algoliaClient from './client';

const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME || 'products';

export async function debugAlgoliaIndex() {
  try {
    console.log('🔍 [Algolia Debug] Starting index inspection...');
    
    const index = algoliaClient;
    
    // Get the first few objects to see the structure
    const searchResult = await index.search([{
      indexName: INDEX_NAME,
      query: '',
      hitsPerPage: 5
    }]);
    
    const firstResult = searchResult.results[0];
    
    console.log('📊 [Algolia Debug] Search results:', {
      totalHits: firstResult.nbHits,
      processingTimeMS: firstResult.processingTimeMS,
      query: firstResult.query,
      facets: firstResult.facets,
      firstHit: firstResult.hits[0] ? {
        objectID: firstResult.hits[0].objectID,
        name: firstResult.hits[0].name,
        brand: firstResult.hits[0].brand,
        categories_without_path: firstResult.hits[0].categories_without_path,
        price: firstResult.hits[0].price,
        rating: firstResult.hits[0].rating,
        availability: firstResult.hits[0].availability,
        // Log all available keys
        availableKeys: Object.keys(firstResult.hits[0])
      } : 'No hits found'
    });
    
    // Try to get settings to see current configuration
    try {
      const settings = await index.getSettings();
      console.log('⚙️ [Algolia Debug] Index settings:', {
        searchableAttributes: settings.searchableAttributes,
        attributesForFaceting: settings.attributesForFaceting,
        facets: settings.facets,
        ranking: settings.ranking
      });
    } catch (settingsError) {
      console.log('⚠️ [Algolia Debug] Could not get settings:', settingsError);
    }
    
  } catch (error) {
    console.error('❌ [Algolia Debug] Error:', error);
  }
} 