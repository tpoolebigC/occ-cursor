'use client';

import { useState, useEffect, useRef } from 'react';
import { searchProducts } from '~/b2b/server-actions';

interface AlgoliaProduct {
  objectID: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  productId: number;
  variantId?: number;
  description?: string;
}

interface ProductSearchProps {
  onProductSelect: (productId: number, quantity: number, variantId?: number) => void;
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AlgoliaProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AlgoliaProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const results = await searchProducts(query);
      setSearchResults(results.slice(0, 5)); // Limit to 5 results
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSelect = (product: AlgoliaProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowResults(false);
    setSearchQuery(product.name);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setShowResults(false);
    setQuantity(1);
  };

  const handleAddToShoppingList = () => {
    if (selectedProduct && quantity > 0) {
      onProductSelect(selectedProduct.productId, quantity, selectedProduct.variantId);
      setSelectedProduct(null);
      setSearchQuery('');
      setSearchResults([]);
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Products
        </label>
        <div className="relative">
          <input
            type="text"
            id="product-search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedProduct(null);
            }}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search by name or SKU..."
            className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {searching && (
              <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {searchQuery && (
              <button
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
            {searchResults.map((product) => (
              <button
                key={product.objectID}
                onClick={() => handleProductSelect(product)}
                className="w-full text-left px-4 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-4"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover rounded" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku} &middot; {formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showResults && searchQuery && !searching && searchResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500">No products found for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Selected Product + Quantity + Add Button */}
      {selectedProduct && (
        <div className="bg-primary-highlight border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            {selectedProduct.imageUrl && (
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-12 h-12 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedProduct.name}</p>
              <p className="text-xs text-gray-500">SKU: {selectedProduct.sku} &middot; {formatPrice(selectedProduct.price)}</p>
            </div>
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="qty" className="text-sm font-medium text-gray-700">Qty:</label>
            <input
              type="number"
              id="qty"
              min="1"
              value={quantity}
              onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setQuantity(v); }}
              className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAddToShoppingList}
              className="flex-1 bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary-shadow transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Shopping List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
