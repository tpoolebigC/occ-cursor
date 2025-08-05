'use client';

import { useState, useEffect } from 'react';

interface B3StorageData {
  [key: string]: any;
}

export function B3StorageDebugger() {
  const [b3Data, setB3Data] = useState<B3StorageData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkB3Storage = () => {
    try {
      // Check if B3Storage is available in the global scope
      const b3Storage = (window as any).B3Storage;
      
      if (b3Storage) {
        const data: B3StorageData = {};
        
        // Get all available B3Storage properties
        Object.keys(b3Storage).forEach(key => {
          try {
            const value = b3Storage[key];
            if (value && typeof value === 'object' && 'value' in value) {
              data[key] = value.value;
            } else {
              data[key] = value;
            }
          } catch (err) {
            data[key] = `Error accessing ${key}: ${err}`;
          }
        });
        
        setB3Data(data);
        setLastChecked(new Date());
        console.log('B3Storage data:', data);
      } else {
        setB3Data(null);
        setLastChecked(new Date());
        console.log('B3Storage not available');
      }
    } catch (error) {
      console.error('Error checking B3Storage:', error);
      setB3Data(null);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately
    checkB3Storage();
    
    // Check every 2 seconds to see if B3Storage becomes available
    const interval = setInterval(checkB3Storage, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const getKeyValue = (key: string) => {
    if (!b3Data) return null;
    return b3Data[key];
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null/undefined';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-green-800">B3Storage Debugger</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkB3Storage}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-green-600 hover:text-green-800"
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-green-700">
          <strong>B3Storage Available:</strong> {b3Data ? 'Yes' : 'No'}
        </p>
        {lastChecked && (
          <p className="text-sm text-green-700">
            <strong>Last Checked:</strong> {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {b3Data && (
        <div className="mt-4">
          <h4 className="font-semibold text-green-800 mb-2">Key B2B Data:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700"><strong>B2B Token:</strong> {getKeyValue('B3B2BToken') ? 'Available' : 'Not available'}</p>
              <p className="text-green-700"><strong>User ID:</strong> {getKeyValue('B3UserId') || 'Not available'}</p>
              <p className="text-green-700"><strong>Company ID:</strong> {getKeyValue('B3CompanyId') || 'Not available'}</p>
              <p className="text-green-700"><strong>Company Name:</strong> {getKeyValue('B3CompanyName') || 'Not available'}</p>
            </div>
            <div>
              <p className="text-green-700"><strong>Role ID:</strong> {getKeyValue('B3RoleId') || 'Not available'}</p>
              <p className="text-green-700"><strong>Is B2C User:</strong> {getKeyValue('B3IsB2CUser') ? 'Yes' : 'No'}</p>
              <p className="text-green-700"><strong>Email:</strong> {getKeyValue('B3Email') || 'Not available'}</p>
              <p className="text-green-700"><strong>Company Status:</strong> {getKeyValue('B3CompanyStatus') || 'Not available'}</p>
            </div>
          </div>
        </div>
      )}

      {isExpanded && b3Data && (
        <div className="mt-4 p-3 bg-green-100 rounded border">
          <h4 className="font-semibold text-green-800 mb-2">Full B3Storage Data:</h4>
          <pre className="text-xs text-green-800 overflow-auto max-h-96">
            {JSON.stringify(b3Data, null, 2)}
          </pre>
        </div>
      )}

      {!b3Data && (
        <div className="mt-4 p-3 bg-yellow-100 rounded border">
          <p className="text-yellow-800 text-sm">
            B3Storage not available yet. This usually means BundleB2B hasn't fully loaded or the user isn't authenticated.
            The debugger will automatically check every 2 seconds.
          </p>
        </div>
      )}
    </div>
  );
} 