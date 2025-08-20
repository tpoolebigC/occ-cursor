'use client';

import { useState, useEffect } from 'react';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { ShoppingLists } from '~/b2b/components/ShoppingLists';
import { getShoppingLists } from '~/b2b/server-actions';

export default function ShoppingListsPage() {
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShoppingLists = async () => {
    try {
      setLoading(true);
      const result = await getShoppingLists();
      
      if (result.error) {
        setError(result.error);
      } else {
        // Handle the case where shoppingLists might be null or undefined
        const lists = result.shoppingLists?.edges?.map((edge: any) => edge.node) || [];
        setShoppingLists(lists);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shopping lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const handleShoppingListUpdate = () => {
    loadShoppingLists();
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
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
                Error Loading Shopping Lists
              </div>
              <div className="text-gray-600 mb-6">{error}</div>
              <button
                onClick={loadShoppingLists}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Lists</h1>
            <p className="text-gray-600">Create and manage your shopping lists for faster ordering</p>
          </div>
          
          <ShoppingLists 
            shoppingLists={shoppingLists} 
            onUpdate={handleShoppingListUpdate}
          />
        </div>
      </div>
    </div>
  );
} 