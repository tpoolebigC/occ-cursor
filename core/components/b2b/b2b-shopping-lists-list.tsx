'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ClipboardDocumentListIcon,
  PlusIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { ShoppingList } from '~/lib/b2b/client';

interface B2BShoppingListsListProps {
  shoppingLists: ShoppingList[];
}

export function B2BShoppingListsList({ shoppingLists }: B2BShoppingListsListProps) {
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);

  if (shoppingLists.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No shopping lists</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new shopping list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shoppingLists.map((list) => (
        <div
          key={list.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {list.name}
                </h3>
                {list.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Default
                  </span>
                )}
              </div>
              
              {list.description && (
                <p className="mt-1 text-sm text-gray-600">{list.description}</p>
              )}
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Items:</span> {list.items.length}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {formatDistanceToNow(new Date(list.updatedAt), { addSuffix: true })}
                </div>
              </div>

              {list.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {list.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500">({item.productSku})</span>
                        <span className="text-gray-600">
                          ${item.salePrice.toFixed(2)} each
                        </span>
                      </div>
                    ))}
                    {list.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{list.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setSelectedList(list)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="View details"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                title="Add to cart"
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit list"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete list"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Shopping List Detail Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedList.name}
                </h2>
                <button
                  onClick={() => setSelectedList(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PlusIcon className="h-6 w-6 rotate-45" />
                </button>
              </div>

              {selectedList.description && (
                <div className="mb-4">
                  <p className="text-gray-600">{selectedList.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Items:</span> {selectedList.items.length}
                  </div>
                  <div>
                    <span className="font-medium">Default List:</span>{' '}
                    {selectedList.isDefault ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(selectedList.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{' '}
                    {new Date(selectedList.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Items:</h3>
                  {selectedList.items.length === 0 ? (
                    <p className="text-gray-500 text-sm">No items in this list.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedList.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-600">SKU: {item.productSku}</div>
                            {item.options && item.options.length > 0 && (
                              <div className="text-sm text-gray-500">
                                Options: {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{item.quantity}x</div>
                            <div className="text-sm text-gray-600">
                              ${item.salePrice.toFixed(2)} each
                            </div>
                            <div className="text-sm font-medium">
                              ${(item.salePrice * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedList(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Add All to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 