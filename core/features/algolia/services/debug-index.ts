import algoliaClient from './client';

const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'products';

export async function debugAlgoliaIndex() {
  try {
    console.log('🔍 [Algolia Debug] Starting index inspection...');
    
    const index = algoliaClient;
    
    // Get the first few objects to see the structure
    const searchResult = await index.search([{
      indexName: INDEX_NAME,
      // query: '', // removed due to type mismatch
      hitsPerPage: 5
    } as any]);
    
    const firstResult = searchResult.results[0];
    
    console.log('📊 [Algolia Debug] Search results:', {
      totalHits: (firstResult as any)?.nbHits || 0,
      processingTimeMS: (firstResult as any)?.processingTimeMS || 0,
      query: (firstResult as any)?.query || '',
      facets: (firstResult as any)?.facets || {},
      firstHit: (firstResult as any)?.hits?.[0] ? {
        objectID: (firstResult as any).hits[0].objectID,
        name: (firstResult as any).hits[0].name,
        brand: (firstResult as any).hits[0].brand,
        categories_without_path: (firstResult as any).hits[0].categories_without_path,
        price: (firstResult as any).hits[0].price,
        rating: (firstResult as any).hits[0].rating,
        availability: (firstResult as any).hits[0].availability,
        // Log all available keys
        availableKeys: Object.keys((firstResult as any).hits[0])
      } : 'No hits found'
    });
    
    // Try to get settings to see current configuration
    try {
      const settings = await index.getSettings({ indexName: INDEX_NAME });
      console.log('⚙️ [Algolia Debug] Index settings:', {
        searchableAttributes: settings.searchableAttributes,
        attributesForFaceting: settings.attributesForFaceting,
        facets: (settings as any).facets || {},
        ranking: settings.ranking
      });
    } catch (settingsError) {
      console.log('⚠️ [Algolia Debug] Could not get settings:', settingsError);
    }
    
  } catch (error) {
    console.error('❌ [Algolia Debug] Error:', error);
  }
} 