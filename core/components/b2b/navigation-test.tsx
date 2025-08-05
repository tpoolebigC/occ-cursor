'use client';

import { useState } from 'react';

export function NavigationTest() {
  const [currentPath, setCurrentPath] = useState('');

  const testRoutes = [
    { name: 'Dashboard', path: '/custom-dashboard' },
    { name: 'Orders', path: '/custom-dashboard/orders' },
    { name: 'Quotes', path: '/custom-dashboard/quotes' },
    { name: 'Invoices', path: '/custom-dashboard/invoices' },
  ];

  const testNavigation = async (path: string) => {
    try {
      setCurrentPath(path);
      console.log(`Testing navigation to: ${path}`);
      
      // Test if the route exists by trying to fetch it
      const response = await fetch(path, { method: 'HEAD' });
      console.log(`Route ${path} status:`, response.status);
      
      if (response.ok) {
        window.location.href = path;
      } else {
        console.error(`Route ${path} returned status:`, response.status);
      }
    } catch (error) {
      console.error(`Error testing route ${path}:`, error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Navigation Test</h3>
      <div className="space-y-1">
        {testRoutes.map((route) => (
          <button
            key={route.path}
            onClick={() => testNavigation(route.path)}
            className={`block w-full text-left px-2 py-1 text-xs rounded ${
              currentPath === route.path 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {route.name}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Current: {currentPath || 'None'}
      </div>
    </div>
  );
} 