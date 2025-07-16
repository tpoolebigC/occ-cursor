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

interface ListItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  currencyCode: string;
}

export function B2BCreateShoppingListForm() {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [listItems, setListItems] = useState<ListItem[]>([]);
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

  const addItemToList = (product: SearchResult) => {
    const existingItem = listItems.find(item => item.productId === parseInt(product.entityId));
    
    if (existingItem) {
      setListItems(items =>
        items.map(item =>
          item.productId === parseInt(product.entityId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: ListItem = {
        productId: parseInt(product.entityId),
        productName: product.name,
        productSku: product.name, // We'll need to get actual SKU from product data
        quantity: 1,
        price: product.prices?.price.value || 0,
        currencyCode: product.prices?.price.currencyCode || 'USD',
      };
      setListItems([...listItems, newItem]);
    }
    
    setSearchResults([]);
    setSearchTerm('');
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setListItems(items => items.filter(item => item.productId !== productId));
    } else {
      setListItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId: number) => {
    setListItems(items => items.filter(item => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      alert('Please enter a list name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/b2b/shopping-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: listName,
          description: description.trim() || undefined,
          isDefault,
          items: listItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.ok) {
        // Reset form
        setListName('');
        setDescription('');
        setIsDefault(false);
        setListItems([]);
        setSearchTerm('');
        setSearchResults([]);
        alert('Shopping list created successfully!');
        // Optionally refresh the page or trigger a callback
        window.location.reload();
      } else {
        throw new Error('Failed to create shopping list');
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* List Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
            List Name *
          </label>
          <input
            type="text"
            id="listName"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter list name..."
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
            Set as default list
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a description for this list..."
        />
      </div>

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
                onClick={() => addItemToList(product)}
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

      {/* List Items */}
      {listItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">List Items</h3>
          <div className="space-y-3">
            {listItems.map((item) => (
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
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !listName.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating List...' : 'Create Shopping List'}
        </button>
      </div>
    </form>
  );
} 