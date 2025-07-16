'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { getSearchResults } from '~/client/queries/get-search-results';
import { useCart } from '~/components/header/cart-provider';

export function QuickOrderForm() {
  const t = useTranslations('B2B.QuickOrder');
  const cart = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for:', term);
      const results = await getSearchResults(term);
      console.log('Search results:', results);
      setSearchResults(results.data?.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = async (product: any) => {
    const quantity = quantities[product.entityId] || 1;
    
    try {
      console.log('Adding to cart:', product.entityId, quantity);
      
      // Use the existing add to cart functionality
      const formData = new FormData();
      formData.append('id', product.entityId);
      formData.append('quantity', quantity.toString());
      
      // Call the product add to cart action - using the correct path
      const response = await fetch('/api/product/add-to-cart', {
        method: 'POST',
        body: formData,
      });

      console.log('Add to cart response:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Add to cart result:', result);
        
        // Update cart count
        cart.increment(quantity);
        
        // Show success message
        alert(`${quantity} item(s) added to cart`);
        
        // Clear quantity for this product
        setQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[product.entityId];
          return newQuantities;
        });
      } else {
        const errorText = await response.text();
        console.error('Add to cart failed:', errorText);
        throw new Error(`Failed to add to cart: ${response.status}`);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleAddAllToCart = async () => {
    const itemsToAdd = searchResults.filter(product => 
      quantities[product.entityId] && quantities[product.entityId] > 0
    );

    if (itemsToAdd.length === 0) {
      alert('Please select quantities for items to add to cart');
      return;
    }

    let totalAdded = 0;
    for (const product of itemsToAdd) {
      try {
        await handleAddToCart(product);
        totalAdded++;
      } catch (error) {
        console.error(`Failed to add ${product.name}:`, error);
      }
    }

    if (totalAdded > 0) {
      alert(`${totalAdded} item(s) added to cart`);
      setQuantities({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          {t('searchLabel')}
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder={t('searchPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{t('searching')}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{t('resultsFound', { count: searchResults.length })}</h3>
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('addAllToCart')}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map((product) => (
              <div key={product.entityId} className="flex items-center space-x-3 p-3 border rounded-md">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                  {product.defaultImage?.url && (
                    <img
                      src={product.defaultImage.url}
                      alt={product.defaultImage.altText || product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    {product.prices?.price?.value ? 
                      `$${product.prices.price.value.toFixed(2)}` : 
                      'Price not available'
                    }
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={quantities[product.entityId] || ''}
                    onChange={(e) => handleQuantityChange(product.entityId, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!quantities[product.entityId] || quantities[product.entityId] <= 0}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>{t('noResults')}</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <strong>Debug Info:</strong>
        <div>Search Term: {searchTerm}</div>
        <div>Results: {searchResults.length}</div>
        <div>Quantities: {JSON.stringify(quantities)}</div>
      </div>
    </div>
  );
} 