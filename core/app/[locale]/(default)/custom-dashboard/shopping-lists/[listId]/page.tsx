'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { ShoppingListDetails } from '~/b2b/components/ShoppingListDetails';
import { getShoppingList } from '~/b2b/server-actions';

export default function ShoppingListDetailsPage() {
  const params = useParams();
  const listId = Number(params.listId);
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const result = await getShoppingList(listId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setShoppingList(result.shoppingList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listId) {
      loadShoppingList();
    }
  }, [listId]);

  const handleShoppingListUpdate = () => {
    loadShoppingList();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-red-600 text-xl font-semibold mb-4">
                Error Loading Shopping List
              </div>
              <div className="text-gray-600 mb-6">{error}</div>
              <button
                onClick={loadShoppingList}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-600 text-xl font-semibold mb-4">
                Shopping List Not Found
              </div>
              <div className="text-gray-500 mb-6">The requested shopping list could not be found.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{shoppingList.name}</h1>
                {shoppingList.description && (
                  <p className="text-gray-600">{shoppingList.description}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ← Back to Lists
                </button>
              </div>
            </div>
          </div>
          
          <ShoppingListDetails 
            shoppingList={shoppingList} 
            onUpdate={handleShoppingListUpdate}
          />
        </div>
      </div>
    </div>
  );
} 