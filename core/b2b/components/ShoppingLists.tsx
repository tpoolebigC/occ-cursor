'use client';

import { useState } from 'react';
import { ShoppingListCard } from './ShoppingListCard';
import { ShoppingListForm } from './ShoppingListForm';

interface ShoppingList {
  entityId: number;
  name: string;
  description?: string;
  items?: any[];
}

interface ShoppingListsProps {
  shoppingLists: ShoppingList[];
  onUpdate: () => void;
}

export function ShoppingLists({ shoppingLists, onUpdate }: ShoppingListsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);

  const handleCreateList = () => {
    setEditingList(null);
    setShowCreateForm(true);
  };

  const handleEditList = (list: ShoppingList) => {
    setEditingList(list);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingList(null);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingList(null);
    onUpdate();
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Your Shopping Lists
          </h2>
          <p className="text-sm text-gray-500">
            {shoppingLists.length} list{shoppingLists.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleCreateList}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create List
        </button>
      </div>

      {/* Shopping Lists Grid */}
      {shoppingLists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No shopping lists</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first shopping list.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateList}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Shopping List
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoppingLists.map((list) => (
            <ShoppingListCard
              key={list.entityId}
              shoppingList={list}
              onEdit={() => handleEditList(list)}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <ShoppingListForm
          shoppingList={editingList}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
} 