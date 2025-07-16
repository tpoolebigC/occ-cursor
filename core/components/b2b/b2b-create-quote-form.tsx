'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSearchResults } from '~/client/queries/get-search-results';

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

interface QuoteItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  currencyCode: string;
}

export function B2BCreateQuoteForm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getSearchResults(term);
      setSearchResults(results.data?.products || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addItemToQuote = (product: SearchResult) => {
    const existingItem = quoteItems.find(item => item.productId === parseInt(product.entityId));
    
    if (existingItem) {
      setQuoteItems(items =>
        items.map(item =>
          item.productId === parseInt(product.entityId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: QuoteItem = {
        productId: parseInt(product.entityId),
        productName: product.name,
        productSku: product.name, // We'll need to get actual SKU from product data
        quantity: 1,
        price: product.prices?.price.value || 0,
        currencyCode: product.prices?.price.currencyCode || 'USD',
      };
      setQuoteItems([...quoteItems, newItem]);
    }
    
    setSearchResults([]);
    setSearchTerm('');
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setQuoteItems(items => items.filter(item => item.productId !== productId));
    } else {
      setQuoteItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId: number) => {
    setQuoteItems(items => items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return quoteItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quoteItems.length === 0) {
      alert('Please add at least one item to the quote.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/b2b/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: quoteItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          notes,
        }),
      });

      if (response.ok) {
        // Reset form
        setQuoteItems([]);
        setNotes('');
        setSearchTerm('');
        setSearchResults([]);
        alert('Quote created successfully!');
        // Optionally refresh the page or trigger a callback
        window.location.reload();
      } else {
        throw new Error('Failed to create quote');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Products
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search for products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={product.entityId}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => addItemToQuote(product)}
              >
                {product.defaultImage && (
                  <img
                    src={product.defaultImage.url}
                    alt={product.defaultImage.altText}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  {product.brand && (
                    <div className="text-sm text-gray-600">{product.brand.name}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${product.prices?.price.value.toFixed(2) || '0.00'}
                  </div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="mt-2 text-sm text-gray-600">Searching...</div>
        )}
      </div>

      {/* Quote Items */}
      {quoteItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Quote Items</h3>
          <div className="space-y-3">
            {quoteItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.productName}</div>
                  <div className="text-sm text-gray-600">SKU: {item.productSku}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${item.price.toFixed(2)} each
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <div className="text-lg font-bold text-gray-900">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any notes or special instructions..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || quoteItems.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Quote...' : 'Create Quote'}
        </button>
      </div>
    </form>
  );
} 