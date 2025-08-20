'use client';

import { useState, useEffect } from 'react';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { AddressBook } from '~/b2b/components/AddressBook';
import { getAddresses } from '~/b2b/server-actions';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAddresses();
      
      if (result.error) {
        setError(result.error);
      } else {
        setAddresses(result.addresses?.edges?.map((edge: any) => edge.node) || []);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = () => {
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Address Book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Address Book</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAddresses}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
              <p className="text-gray-600">Manage your shipping and billing addresses</p>
            </div>
            <a
              href="/custom-dashboard"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        <AddressBook 
          addresses={addresses} 
          onAddressUpdate={handleAddressUpdate}
        />
      </div>
    </div>
  );
} 