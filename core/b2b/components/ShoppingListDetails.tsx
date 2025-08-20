'use client';

import { useState } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { AlgoliaProductSearch } from './AlgoliaProductSearch';
import { ShoppingListWorkflow } from './ShoppingListWorkflow';
import { addItemToShoppingList, removeItemFromShoppingList, updateShoppingListItem } from '~/b2b/server-actions';
import { addToCart } from '~/b2b/services/cartService';

interface ShoppingList {
  entityId: number;
  name: string;
  description?: string;
  items?: any[];
}

interface ShoppingListDetailsProps {
  shoppingList: ShoppingList;
  onUpdate: () => void;
}

export function ShoppingListDetails({ shoppingList, onUpdate }: ShoppingListDetailsProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const handleAddItem = async (productId: number, quantity: number) => {
    try {
      const result = await addItemToShoppingList(shoppingList.entityId, {
        productEntityId: productId,
        quantity
      });
      
      if (result.error) {
        alert(`Error adding item: ${result.error}`);
      } else {
        setShowAddProduct(false);
        onUpdate();
      }
    } catch (error) {
      alert('Failed to add item to shopping list');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item from the shopping list?')) {
      return;
    }

    try {
      const result = await removeItemFromShoppingList(shoppingList.entityId, itemId);
      
      if (result.error) {
        alert(`Error removing item: ${result.error}`);
      } else {
        onUpdate();
      }
    } catch (error) {
      alert('Failed to remove item from shopping list');
    }
  };

  const handleUpdateItemQuantity = async (itemId: number, quantity: number) => {
    try {
      const result = await updateShoppingListItem(shoppingList.entityId, itemId, {
        productEntityId: 0, // We don't need to update the product ID
        quantity
      });
      
      if (result.error) {
        alert(`Error updating item: ${result.error}`);
      } else {
        onUpdate();
      }
    } catch (error) {
      alert('Failed to update item quantity');
    }
  };

  const handleAddAllToCart = async () => {
    if (!shoppingList.items || shoppingList.items.length === 0) {
      alert('No items to add to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of shoppingList.items) {
        try {
          const result = await addToCart([{
            productEntityId: item.productEntityId,
            quantity: item.quantity
          }]);
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Failed to add item ${item.productEntityId} to cart:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully added ${successCount} item${successCount !== 1 ? 's' : ''} to cart${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      } else {
        alert('Failed to add any items to cart');
      }
    } catch (error) {
      alert('Failed to add items to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!shoppingList.items || shoppingList.items.length === 0) {
      alert('No items to create quote from');
      return;
    }

    setIsCreatingQuote(true);
    try {
      // TODO: Implement quote creation from shopping list
      alert('Quote creation from shopping list is coming soon!');
    } catch (error) {
      alert('Failed to create quote');
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const itemCount = shoppingList.items?.length || 0;
  const totalItems = shoppingList.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Workflow Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShoppingListWorkflow shoppingList={shoppingList} onUpdate={onUpdate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Shopping List Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Items ({itemCount})</h2>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
              </div>
            </div>

          <div className="p-6">
            {itemCount === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding products to your shopping list.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add First Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {shoppingList.items?.map((item) => (
                  <ShoppingListItem
                    key={item.entityId}
                    item={item}
                    onRemove={() => handleRemoveItem(item.entityId)}
                    onUpdateQuantity={(quantity) => handleUpdateItemQuantity(item.entityId, quantity)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Add Product to List</h2>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AlgoliaProductSearch onProductSelect={handleAddItem} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Actions and Summary */}
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Quantity:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleAddAllToCart}
              disabled={isAddingToCart || itemCount === 0}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding to Cart...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Add All to Cart
                </>
              )}
            </button>

            <button
              onClick={handleCreateQuote}
              disabled={isCreatingQuote || itemCount === 0}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreatingQuote ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Quote...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Quote
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 