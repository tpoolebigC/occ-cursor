import { debugAlgoliaIndex } from '~/lib/algolia/debug-index';
import { fetchAlgoliaFacetedSearch } from '~/lib/algolia/faceted-search';

export default async function AlgoliaDebugPage() {
  // Debug the index
  await debugAlgoliaIndex();
  
  // Test faceted search
  const searchResults = await fetchAlgoliaFacetedSearch({
    term: 'plant',
    page: 0,
    limit: 5
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Algolia Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Search Results for "plant"</h2>
        <p>Total results: {searchResults.products.collectionInfo.totalItems}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Facets Returned</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(searchResults.facets, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">First 3 Products</h2>
        <div className="space-y-2">
          {searchResults.products.items.slice(0, 3).map((product: any, index: number) => (
            <div key={index} className="border p-3 rounded">
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Brand:</strong> {product.brand?.name || 'N/A'}</p>
              <p><strong>Categories:</strong> {product.categories_without_path?.join(', ') || 'N/A'}</p>
              <p><strong>Price:</strong> ${product.default_price || 'N/A'}</p>
              <p><strong>In Stock:</strong> {product.in_stock ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><strong>APP_ID:</strong> {process.env.ALGOLIA_APPLICATION_ID ? 'SET' : 'NOT SET'}</p>
          <p><strong>APP_KEY:</strong> {process.env.ALGOLIA_SEARCH_API_KEY ? 'SET' : 'NOT SET'}</p>
          <p><strong>INDEX_NAME:</strong> {process.env.ALGOLIA_INDEX_NAME || 'products'}</p>
        </div>
      </div>
    </div>
  );
} 