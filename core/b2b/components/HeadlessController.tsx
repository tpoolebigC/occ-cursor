/**
 * HeadlessController Component
 * 
 * This component exposes an API for external control of the B2B application.
 * It initializes the window.b2b object with methods for external code to interact with the application.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useB2BAuth } from '../hooks/useB2BAuth';
import { useGlobalContext } from '../context/GlobalContext';
import { getAllowedRoutesWithoutComponent } from './B3RenderRouter';
import { CustomerRole, CompanyStatus } from '../utils/b2bAuthManager';

// Event manager for callbacks
class EventManager {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  dispatchEvent(event: string, data?: any) {
    this.emit(event, data);
  }
}

// Quote management interface
interface QuoteManager {
  addProduct: (productId: number, quantity: number, options?: any) => Promise<any>;
  getConfig: () => Promise<any>;
  submit: (data: any) => Promise<any>;
  getList: () => Promise<any>;
  getDetail: (quoteId: number) => Promise<any>;
}

// User management interface
interface UserManager {
  getProfile: () => Promise<any>;
  getB2BToken: () => string | null;
  isMasquerading: () => boolean;
  endMasquerading: () => Promise<void>;
  getCompanyInfo: () => Promise<any>;
}

// Shopping list management interface
interface ShoppingListManager {
  create: (data: any) => Promise<any>;
  getList: () => Promise<any>;
  addProduct: (listId: number, productId: number, quantity: number) => Promise<any>;
  removeProduct: (listId: number, productId: number) => Promise<any>;
}

// Cart management interface
interface CartManager {
  getEntityId: () => string | null;
  getItems: () => Promise<any>;
  addItem: (productId: number, quantity: number, options?: any) => Promise<any>;
  updateItem: (itemId: string, quantity: number) => Promise<any>;
  removeItem: (itemId: string) => Promise<any>;
  clear: () => Promise<void>;
}

// Main HeadlessController component
interface HeadlessControllerProps {
  children?: React.ReactNode;
}

export function HeadlessController({ children }: HeadlessControllerProps) {
  const auth = useB2BAuth();
  const { state: globalState } = useGlobalContext();
  const eventManagerRef = useRef<EventManager>(new EventManager());

  useEffect(() => {
    // Initialize the window.b2b object
    const initializeB2BAPI = () => {
      // Get user context for route filtering
      const userRole = auth.getUserRole();
      const companyStatus = auth.getCompanyStatus();
      const permissions = auth.getPermissions().map(p => p.code);

      // Quote management
      const quoteManager: QuoteManager = {
        addProduct: async (productId: number, quantity: number, options?: any) => {
          console.log('B2B API: Adding product to quote', { productId, quantity, options });
          // Implementation would call the actual quote API
          return { success: true, productId, quantity };
        },
        getConfig: async () => {
          console.log('B2B API: Getting quote config');
          return { enabled: globalState.productQuoteEnabled };
        },
        submit: async (data: any) => {
          console.log('B2B API: Submitting quote', data);
          // Implementation would submit the quote
          return { success: true, quoteId: Date.now() };
        },
        getList: async () => {
          console.log('B2B API: Getting quote list');
          // Implementation would fetch quotes
          return { quotes: [] };
        },
        getDetail: async (quoteId: number) => {
          console.log('B2B API: Getting quote detail', quoteId);
          // Implementation would fetch quote details
          return { quoteId, items: [] };
        },
      };

      // User management
      const userManager: UserManager = {
        getProfile: async () => {
          console.log('B2B API: Getting user profile');
          return auth.userContext;
        },
        getB2BToken: () => {
          return auth.userContext?.b2bToken || null;
        },
        isMasquerading: () => {
          return auth.isMasquerading();
        },
        endMasquerading: async () => {
          console.log('B2B API: Ending masquerading');
          // Implementation would end masquerading
        },
        getCompanyInfo: async () => {
          console.log('B2B API: Getting company info');
          return auth.getCompanyInfo();
        },
      };

      // Shopping list management
      const shoppingListManager: ShoppingListManager = {
        create: async (data: any) => {
          console.log('B2B API: Creating shopping list', data);
          // Implementation would create shopping list
          return { success: true, listId: Date.now() };
        },
        getList: async () => {
          console.log('B2B API: Getting shopping lists');
          // Implementation would fetch shopping lists
          return { lists: [] };
        },
        addProduct: async (listId: number, productId: number, quantity: number) => {
          console.log('B2B API: Adding product to shopping list', { listId, productId, quantity });
          // Implementation would add product to list
          return { success: true };
        },
        removeProduct: async (listId: number, productId: number) => {
          console.log('B2B API: Removing product from shopping list', { listId, productId });
          // Implementation would remove product from list
          return { success: true };
        },
      };

      // Cart management
      const cartManager: CartManager = {
        getEntityId: () => {
          // This would get the actual cart ID from the cart system
          return 'cart-' + Date.now();
        },
        getItems: async () => {
          console.log('B2B API: Getting cart items');
          // Implementation would fetch cart items
          return { items: [] };
        },
        addItem: async (productId: number, quantity: number, options?: any) => {
          console.log('B2B API: Adding item to cart', { productId, quantity, options });
          // Implementation would add item to cart
          return { success: true, itemId: 'item-' + Date.now() };
        },
        updateItem: async (itemId: string, quantity: number) => {
          console.log('B2B API: Updating cart item', { itemId, quantity });
          // Implementation would update cart item
          return { success: true };
        },
        removeItem: async (itemId: string) => {
          console.log('B2B API: Removing cart item', { itemId });
          // Implementation would remove cart item
          return { success: true };
        },
        clear: async () => {
          console.log('B2B API: Clearing cart');
          // Implementation would clear cart
        },
      };

      // Initialize window.b2b object
      (window as any).b2b = {
        ...(window as any).b2b,
        callbacks: eventManagerRef.current,
        utils: {
          // Route management
          getRoutes: () => {
            if (!userRole || !companyStatus) return [];
            return getAllowedRoutesWithoutComponent(userRole, companyStatus, permissions, {
              productQuoteEnabled: globalState.productQuoteEnabled,
              cartQuoteEnabled: globalState.cartQuoteEnabled,
              shoppingListEnabled: globalState.shoppingListEnabled,
              registerEnabled: globalState.registerEnabled,
            });
          },
          
          // Navigation
          openPage: (page: string) => {
            console.log('B2B API: Opening page', page);
            // This would trigger navigation to the specified page
            eventManagerRef.current.emit('page-opened', { page });
          },
          
          // Quote management
          quote: quoteManager,
          
          // User management
          user: userManager,
          
          // Shopping list management
          shoppingList: shoppingListManager,
          
          // Cart management
          cart: cartManager,
          
          // Authentication
          auth: {
            isAuthenticated: () => auth.isAuthenticated,
            getUserContext: () => auth.userContext,
            logout: () => auth.logout(),
            reauthenticate: () => auth.reauthenticate(),
          },
          
          // Feature flags
          features: {
            isQuoteEnabled: () => globalState.productQuoteEnabled,
            isShoppingListEnabled: () => globalState.shoppingListEnabled,
            isRegisterEnabled: () => globalState.registerEnabled,
          },
          
          // Store information
          store: {
            getInfo: () => ({
              storeEnabled: globalState.storeEnabled,
              storeName: globalState.storeName,
              b2bChannelId: globalState.b2bChannelId,
            }),
          },
        },
        
        // Event management
        on: (event: string, callback: (data: any) => void) => {
          eventManagerRef.current.on(event, callback);
        },
        
        off: (event: string, callback: (data: any) => void) => {
          eventManagerRef.current.off(event, callback);
        },
        
        emit: (event: string, data: any) => {
          eventManagerRef.current.emit(event, data);
        },
      };

      console.log('B2B Headless API initialized');
    };

    // Initialize the API
    initializeB2BAPI();

    // Cleanup on unmount
    return () => {
      if ((window as any).b2b) {
        delete (window as any).b2b;
      }
    };
  }, [auth, globalState]);

  // Expose debug information in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('B2B Headless API Debug Info:', {
        isAuthenticated: auth.isAuthenticated,
        userRole: auth.getUserRole(),
        companyStatus: auth.getCompanyStatus(),
        permissions: auth.getPermissions().map(p => p.code),
        featureFlags: {
          productQuoteEnabled: globalState.productQuoteEnabled,
          cartQuoteEnabled: globalState.cartQuoteEnabled,
          shoppingListEnabled: globalState.shoppingListEnabled,
          registerEnabled: globalState.registerEnabled,
        },
      });
    }
  }, [auth, globalState]);

  return (
    <div className="headless-controller">
      {children}
      
      {/* Debug panel in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
          <h4 className="font-semibold mb-2">Headless API Debug</h4>
          <p><strong>Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Role:</strong> {auth.getUserRole()}</p>
          <p><strong>Company Status:</strong> {auth.getCompanyStatus()}</p>
          <p><strong>Permissions:</strong> {auth.getPermissions().length}</p>
          <p><strong>Feature Flags:</strong></p>
          <ul className="ml-2">
            <li>Quotes: {globalState.productQuoteEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>Shopping Lists: {globalState.shoppingListEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>Register: {globalState.registerEnabled ? 'Enabled' : 'Disabled'}</li>
          </ul>
          <p className="mt-2 text-gray-400">
            API available at: window.b2b
          </p>
        </div>
      )}
    </div>
  );
}

// Export utility functions for external use
export const getB2BAPI = () => (window as any).b2b;
export const isB2BAPIReady = () => !!(window as any).b2b; 