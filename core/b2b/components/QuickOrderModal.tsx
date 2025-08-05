'use client';

import { useState, useEffect } from 'react';
import { searchAlgoliaProducts } from '~/b2b/server-actions';
import { AlgoliaProduct } from '~/b2b/server-actions';

interface CartItem {
  product: AlgoliaProduct;
  quantity: number;
}

interface QuickOrderModalProps {
  onClose: () => void;
  onOrderPlaced: () => void;
}

export function QuickOrderModal({ onClose, onOrderPlaced }: QuickOrderModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AlgoliaProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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

  const addToCart = (product: AlgoliaProduct) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.objectID === product.objectID);
      if (existingItem) {
        return prev.map(item =>
          item.product.objectID === product.objectID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.objectID === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.objectID !== productId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price || '0');
      return total + (price * item.quantity);
    }, 0);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);
    try {
      // Here you would integrate with BigCommerce cart/checkout API
      // For now, we'll simulate the order placement
      console.log('Placing order with items:', cartItems);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and close modal
      setCartItems([]);
      onOrderPlaced();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quick Order</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Search */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Search Products</h4>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by product name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {searching && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                {searchResults.map((product) => (
                  <div key={product.objectID} className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">{product.name}</h5>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      <p className="text-sm font-semibold text-gray-900">${product.price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && !searching && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items ({cartItems.length})</h4>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <p className="mt-2">Your cart is empty</p>
                <p className="text-sm">Search for products to add to your order</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  {cartItems.map((item) => (
                    <div key={item.product.objectID} className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0">
                      {item.product.imageUrl && (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h5>
                        <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                        <p className="text-sm font-semibold text-gray-900">${item.product.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.objectID, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.objectID, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.objectID)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={isPlacingOrder || cartItems.length === 0}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlacingOrder ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Placing Order...
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 