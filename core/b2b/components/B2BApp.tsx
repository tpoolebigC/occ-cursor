/**
 * B2B App Component
 * 
 * This is the main application component that orchestrates initialization,
 * authentication, and setup of the core B2B Buyer Portal architecture.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useB2BAuth } from '../hooks/useB2BAuth';
import { useB2BAuthRequired } from '../hooks/useB2BAuth';
import { GlobalProvider, useGlobalContext } from '../context/GlobalContext';
import { B3RenderRouter, useB3AppOpen } from './B3RenderRouter';
import { HeadlessController } from './HeadlessController';
import { B2BNavigation } from './B2BNavigation';

// Store container component for store initialization
interface B3StoreContainerProps {
  children: React.ReactNode;
}

function B3StoreContainer({ children }: B3StoreContainerProps) {
  const { dispatch } = useGlobalContext();
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        console.log('B2B App: Initializing store...');
        
        // Simulate store initialization (replace with actual store API calls)
        const storeConfig = {
          storeEnabled: true,
          storeName: 'BigBiz B2B Store',
          b2bChannelId: 1,
          countriesList: [
            { code: 'US', name: 'United States' },
            { code: 'CA', name: 'Canada' },
          ],
          multiStorefrontEnabled: false,
        };

        // Update global state with store configuration
        dispatch({ type: 'SET_STORE_CONFIG', payload: storeConfig });
        
        // Set quote configuration
        const quoteConfig = {
          productQuoteEnabled: true,
          cartQuoteEnabled: true,
          shoppingListEnabled: true,
          registerEnabled: true,
          quoteConfig: [],
        };
        
        dispatch({ type: 'SET_QUOTE_CONFIG', payload: quoteConfig });
        
        setIsStoreInitialized(true);
        console.log('B2B App: Store initialized successfully');
        
      } catch (error) {
        console.error('B2B App: Store initialization failed:', error);
        // Set minimal store config to allow app to function
        dispatch({ 
          type: 'SET_STORE_CONFIG', 
          payload: { storeEnabled: false, storeName: 'Store Unavailable' } 
        });
        setIsStoreInitialized(true);
      }
    };

    initializeStore();
  }, [dispatch]);

  if (!isStoreInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing store...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Main B2B App component
interface B2BAppProps {
  children?: React.ReactNode;
}

function B2BAppInner({ children }: B2BAppProps) {
  const auth = useB2BAuthRequired();
  const { state: globalState, dispatch } = useGlobalContext();
  
  // Navigation state management
  const [{ isOpen, openUrl, params }, setOpenPage] = useB3AppOpen({
    isOpen: false,
    openUrl: '',
    params: {},
  });

  // Application initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('B2B App: Starting application initialization...');
        
        // Step 1: Initialize authentication
        if (!auth.isAuthenticated) {
          console.log('B2B App: Waiting for authentication...');
          return;
        }

        console.log('B2B App: Authentication complete, initializing application...');
        
        // Step 2: Load additional configuration
        await Promise.allSettled([
          // Load store tax zone rates (simulated)
          new Promise(resolve => {
            console.log('B2B App: Loading tax zone rates...');
            setTimeout(resolve, 100);
          }),
          
          // Load template configuration (simulated)
          new Promise(resolve => {
            console.log('B2B App: Loading template configuration...');
            setTimeout(resolve, 100);
          }),
          
          // Load additional company information (simulated)
          new Promise(resolve => {
            console.log('B2B App: Loading company information...');
            setTimeout(resolve, 100);
          }),
        ]);

        console.log('B2B App: Application initialization complete');
        
        // Step 3: Navigate to appropriate page based on user role
        const userRole = auth.getUserRole();
        const companyStatus = auth.getCompanyStatus();
        
        if (userRole && companyStatus) {
          console.log('B2B App: User role and company status determined', { userRole, companyStatus });
          
          // Navigate to dashboard by default
          setOpenPage('/custom-dashboard');
        }
        
      } catch (error) {
        console.error('B2B App: Application initialization failed:', error);
      }
    };

    initializeApp();
  }, [auth.isAuthenticated, auth.userContext, setOpenPage]);

  // Show loading state while authentication is in progress
  if (!auth.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing B2B Portal...</p>
          <p className="text-sm text-gray-500 mt-2">
            {auth.isLoading ? 'Loading...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{auth.error}</p>
          <button
            onClick={() => auth.reauthenticate()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show store disabled message if store is not enabled
  if (!globalState.storeEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Unavailable</h1>
          <p className="text-gray-600">The B2B store is currently not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="b2b-app">
      {/* Headless Controller for external API */}
      <HeadlessController>
        {/* Navigation */}
        <B2BNavigation activeTab="dashboard" />
        
        {/* Main content area */}
        <main className="flex-1">
          <B3RenderRouter setOpenPage={setOpenPage} />
        </main>
        
        {/* Page mask for loading states */}
        {globalState.showPageMask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </HeadlessController>
      
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
          <h4 className="font-semibold mb-2">B2B App Debug</h4>
          <p><strong>Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Role:</strong> {auth.getUserRole()}</p>
          <p><strong>Company Status:</strong> {auth.getCompanyStatus()}</p>
          <p><strong>Store Enabled:</strong> {globalState.storeEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Feature Flags:</strong></p>
          <ul className="ml-2">
            <li>Quotes: {globalState.productQuoteEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>Shopping Lists: {globalState.shoppingListEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>Register: {globalState.registerEnabled ? 'Enabled' : 'Disabled'}</li>
          </ul>
          <p><strong>Navigation:</strong></p>
          <ul className="ml-2">
            <li>Is Open: {isOpen ? 'Yes' : 'No'}</li>
            <li>Open URL: {openUrl || 'None'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Main export with providers
export function B2BApp({ children }: B2BAppProps) {
  return (
    <GlobalProvider>
      <B3StoreContainer>
        <B2BAppInner>{children}</B2BAppInner>
      </B3StoreContainer>
    </GlobalProvider>
  );
}

// Export individual components for flexibility
export { B2BAppInner };
export { B3StoreContainer }; 