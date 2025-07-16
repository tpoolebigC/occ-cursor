'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSearchResults } from '~/client/queries/get-search-results';
import { useCart } from '~/components/header/cart-provider';

interface SearchResult {
  entityId: string;
  name: string;
  path: string;
  defaultImage?: {
    altText: string;
    url: string;
  };
  prices?: {
    price: {
      value: number;
      currencyCode: string;
    };
  };
  brand?: {
    name: string;
  };
}

interface CartItem {
  product: SearchResult;
  quantity: number;
}

export function B2BQuickOrderForm() {
  const t = useTranslations('B2B.QuickOrder');
  const cart = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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

  const addToCartItems = (product: SearchResult) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.entityId === product.entityId);
      if (existingItem) {
        return prev.map(item =>
          item.product.entityId === product.entityId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartItems(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.entityId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCartItems = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.entityId !== productId));
  };

  const handleAddAllToCart = async () => {
    if (cartItems.length === 0) {
      alert('Please add items to your quick order first');
      return;
    }

    setIsAddingToCart(true);
    let totalAdded = 0;

    try {
      for (const item of cartItems) {
        const formData = new FormData();
        formData.append('id', item.product.entityId);
        formData.append('quantity', item.quantity.toString());
        
        const response = await fetch('/api/product/add-to-cart', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          totalAdded += item.quantity;
          cart.increment(item.quantity);
        } else {
          console.error(`Failed to add ${item.product.name} to cart`);
        }
      }

      if (totalAdded > 0) {
        alert(`Successfully added ${totalAdded} item(s) to cart`);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      alert('Some items failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cartItems.reduce((sum, item) => 
    sum + (item.product.prices?.price?.value || 0) * item.quantity, 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Search Section */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Products</h2>
          
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-4 text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Searching...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <div key={product.entityId} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  {/* Product Image */}
                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
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
                    {product.brand?.name && (
                      <p className="text-xs text-gray-500">{product.brand.name}</p>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {product.prices?.price?.value ? 
                        `$${product.prices.price.value.toFixed(2)}` : 
                        'Price not available'
                      }
                    </p>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => addToCartItems(product)}
                    className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="mt-4 text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items Section */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Quick Order Cart</h2>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No items in quick order cart</p>
              <p className="text-sm text-gray-400 mt-1">Search and add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.entityId} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    {item.product.defaultImage?.url && (
                      <img
                        src={item.product.defaultImage.url}
                        alt={item.product.defaultImage.altText || item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-900">
                      ${(item.product.prices?.price?.value || 0) * item.quantity} 
                      <span className="text-gray-500"> (${item.product.prices?.price?.value?.toFixed(2)} each)</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.entityId, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.entityId, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCartItems(item.product.entityId)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Items:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Value:</span>
                  <span className="font-medium">${totalValue.toFixed(2)}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddAllToCart}
                disabled={isAddingToCart}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingToCart ? 'Adding to Cart...' : `Add ${totalItems} Item(s) to Cart`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 