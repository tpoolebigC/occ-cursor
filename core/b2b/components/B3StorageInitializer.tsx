'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { waitForB3Storage, isB3StorageAvailable } from '../utils/b3StorageUtils';

export function B3StorageInitializer() {
  const { data: session } = useSession();
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<string>('Waiting for B3Storage...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initializeB3Storage = async () => {
    setIsInitializing(true);
    setError(null);
    setSuccess(false);
    setStatus('Initializing B3Storage...');

    try {
      // First, check if B2B script is loaded
      const b2b = (window as any).b2b;
      if (!b2b) {
        setStatus('B2B script not loaded, attempting to trigger initialization...');
        
        // Try to trigger B2B initialization
        if ((window as any).B3) {
          console.log('B3 config found, triggering B2B initialization...');
          
          // Dispatch a custom event to trigger B2B initialization
          window.dispatchEvent(new CustomEvent('b2b-init-request'));
          
          // Wait a bit for the script to respond
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Check if B3Storage is already available
      if (isB3StorageAvailable()) {
        setStatus('B3Storage already available!');
        setSuccess(true);
        return;
      }

      setStatus('Waiting for B3Storage to become available...');
      
      // Wait for B3Storage with a longer timeout
      const data = await waitForB3Storage(15000);
      
      setStatus('B3Storage initialized successfully!');
      setSuccess(true);
      console.log('B3Storage data:', data);
      
      // Trigger a page refresh to update all components
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('Failed to initialize B3Storage');
      console.error('B3Storage initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const checkB2BScript = () => {
    const b2b = (window as any).b2b;
    const b3 = (window as any).B3;
    const b3Storage = (window as any).B3Storage;
    
    console.log('B2B Script Status:', {
      hasB2B: !!b2b,
      hasB3: !!b3,
      hasB3Storage: !!b3Storage,
      b2bKeys: b2b ? Object.keys(b2b) : [],
      b3Keys: b3 ? Object.keys(b3) : [],
      b3StorageKeys: b3Storage ? Object.keys(b3Storage) : [],
    });
    
    return { b2b, b3, b3Storage };
  };

  const triggerB2BInit = () => {
    console.log('Manually triggering B2B initialization...');
    
    // Try multiple ways to trigger B2B initialization
    if ((window as any).b2b?.init) {
      (window as any).b2b.init();
    }
    
    if ((window as any).b2b?.utils?.user?.init) {
      (window as any).b2b.utils.user.init();
    }
    
    // Dispatch custom events
    window.dispatchEvent(new CustomEvent('b2b-init-request'));
    window.dispatchEvent(new CustomEvent('b2b-auth-request'));
    
    // Try to trigger cart creation
    if ((window as any).b2bDebug?.triggerCartCreated) {
      (window as any).b2bDebug.triggerCartCreated();
    }
  };

  useEffect(() => {
    // Check B2B script status on mount
    const scriptStatus = checkB2BScript();
    
    if (scriptStatus.b3Storage) {
      setStatus('B3Storage already available!');
      setSuccess(true);
    } else if (scriptStatus.b2b) {
      setStatus('B2B script loaded, waiting for B3Storage...');
    } else {
      setStatus('B2B script not loaded');
    }
  }, []);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-800">B3Storage Initializer</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkB2BScript}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Check Scripts
          </button>
          <button
            onClick={triggerB2BInit}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Trigger B2B Init
          </button>
          <button
            onClick={initializeB3Storage}
            disabled={isInitializing}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {isInitializing ? 'Initializing...' : 'Initialize B3Storage'}
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-purple-700">
          <strong>Status:</strong> {status}
        </p>
        <p className="text-sm text-purple-700">
          <strong>Session:</strong> {session ? 'Available' : 'Not available'}
        </p>
        <p className="text-sm text-purple-700">
          <strong>Customer Token:</strong> {session?.user?.customerAccessToken ? 'Available' : 'Not available'}
        </p>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-100 rounded border">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-100 rounded border">
          <p className="text-green-800 text-sm">B3Storage initialized successfully! Page will refresh shortly...</p>
        </div>
      )}

      <div className="mt-3 p-3 bg-purple-100 rounded border">
        <h4 className="font-semibold text-purple-800 mb-2">Debug Info:</h4>
        <p className="text-xs text-purple-700">
          This component helps initialize B3Storage when it's not automatically available.
          Since you're logged in but B3Storage isn't showing, this should help trigger the initialization.
        </p>
      </div>
    </div>
  );
} 