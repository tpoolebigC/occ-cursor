'use client';

import { useState, useEffect } from 'react';
import { searchAlgoliaProducts } from '~/b2b/server-actions';

interface QuickOrderProduct {
  objectID: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  productId: number;
  description?: string;
  lastOrdered?: string;
  orderCount?: number;
}

interface QuickOrderTableProps {
  onAddToCart: (product: QuickOrderProduct, quantity: number) => void;
  showPreviouslyOrdered?: boolean;
}

export default function QuickOrderTable({ onAddToCart, showPreviouslyOrdered = true }: QuickOrderTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickOrderProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [previouslyOrdered, setPreviouslyOrdered] = useState<QuickOrderProduct[]>([]);
  const [loadingPreviouslyOrdered, setLoadingPreviouslyOrdered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchAlgoliaProducts(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadPreviouslyOrdered = async () => {
    setLoadingPreviouslyOrdered(true);
    try {
      // In a real implementation, this would fetch from order history
      // For now, we'll simulate with some sample data
      const samplePreviouslyOrdered: QuickOrderProduct[] = [
        {
          objectID: '1',
          name: 'Snake Plant',
          sku: 'SNAKE-001',
          price: 109.99,
          imageUrl: 'https://cdn11.bigcommerce.com/s-7qgtlochx0/images/stencil/150x150/products/140/442/snake-plant-1__26586__58982.1736974327.jpg',
          productId: 140,
          lastOrdered: '2024-01-15',
          orderCount: 3
        },
        {
          objectID: '2',
          name: 'Spray Bottle',
          sku: 'SPRAY-001',
          price: 15.00,
          imageUrl: 'https://cdn11.bigcommerce.com/s-7qgtlochx0/images/stencil/150x150/products/141/443/spray-bottle-1__66563__31663.1736974328.jpg',
          productId: 141,
          lastOrdered: '2024-01-10',
          orderCount: 2
        }
      ];
      setPreviouslyOrdered(samplePreviouslyOrdered);
    } catch (err) {
      console.error('Error loading previously ordered:', err);
      setPreviouslyOrdered([]);
    } finally {
      setLoadingPreviouslyOrdered(false);
    }
  };

  useEffect(() => {
    if (showPreviouslyOrdered) {
      loadPreviouslyOrdered();
    }
  }, [showPreviouslyOrdered]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderProductRow = (product: QuickOrderProduct, isPreviouslyOrdered = false) => (
    <tr key={product.objectID} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 object-cover rounded mr-4"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
            {isPreviouslyOrdered && product.lastOrdered && (
              <div className="text-xs text-gray-400">
                Last ordered: {new Date(product.lastOrdered).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPrice(product.salePrice || product.price)}
      </td>
      {isPreviouslyOrdered && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {product.orderCount || 0} times
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            defaultValue="1"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            onChange={(e) => {
              const quantity = parseInt(e.target.value) || 1;
              onAddToCart(product, quantity);
            }}
          />
          <button
            onClick={() => onAddToCart(product, 1)}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for products by name, SKU, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {searching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Previously Ordered Products */}
      {showPreviouslyOrdered && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Previously Ordered</h3>
          </div>
          {loadingPreviouslyOrdered ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading previously ordered products...</p>
            </div>
          ) : previouslyOrdered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previouslyOrdered.map(product => renderProductRow(product, true))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No previously ordered products found</p>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map(product => renderProductRow(product, false))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && !searching && searchResults.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No products found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try searching with different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
} 