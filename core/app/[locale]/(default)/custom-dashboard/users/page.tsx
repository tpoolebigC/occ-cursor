'use client';

import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { UserManagementDashboard } from '~/b2b/components/UserManagementDashboard';
import { Button, Card } from '~/vibes';
import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVibesTest, setShowVibesTest] = useState(false);

  useEffect(() => {
    // Simulate loading and check for errors
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <B2BNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
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
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : showVibesTest ? (
            <div className="space-y-6">
              <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-lg">
                <h1 className="text-2xl font-bold text-gray-900">VIBES Test</h1>
                <p className="text-gray-600 mt-2">Testing VIBES components...</p>
                <div className="mt-4 space-x-4">
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => setShowVibesTest(false)}
                  >
                    Back to User Management
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => alert('VIBES Button works!')}
                  >
                    Test Button
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-lg">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Choose an option:</p>
                <div className="mt-4 space-x-4">
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => setShowVibesTest(true)}
                  >
                    Test VIBES Components
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => {
                      try {
                        // Try to render the full dashboard
                        setError(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Unknown error');
                      }
                    }}
                  >
                    Load Full Dashboard
                  </Button>
                </div>
              </div>
              
              {/* Render the full dashboard */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                <UserManagementDashboard />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 