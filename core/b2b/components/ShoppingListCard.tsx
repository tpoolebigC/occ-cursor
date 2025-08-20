'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteShoppingList } from '~/b2b/server-actions';

interface ShoppingList {
  entityId: number;
  name: string;
  description?: string;
  items?: any[];
}

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onEdit: () => void;
  onUpdate: () => void;
}

export function ShoppingListCard({ shoppingList, onEdit, onUpdate }: ShoppingListCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shopping list?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteShoppingList(shoppingList.entityId);
      
      if (result.error) {
        alert(`Error deleting shopping list: ${result.error}`);
      } else {
        onUpdate();
      }
    } catch (error) {
      alert('Failed to delete shopping list');
    } finally {
      setIsDeleting(false);
    }
  };

  const itemCount = shoppingList.items?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {shoppingList.name}
            </h3>
            {shoppingList.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {shoppingList.description}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle menu - simplified for now
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/custom-dashboard/shopping-lists/${shoppingList.entityId}`}
            className="flex-1 bg-indigo-600 text-white text-center py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            View List
          </Link>
          
          <button
            onClick={onEdit}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-900 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
} 