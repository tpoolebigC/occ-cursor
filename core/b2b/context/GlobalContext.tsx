/**
 * Global Context for B2B Buyer Portal
 * 
 * This component manages global application state including feature flags,
 * store configuration, and user interface state.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useB2BAuth } from '../hooks/useB2BAuth';
import { CustomerRole, CompanyStatus } from '../utils/b2bAuthManager';

// Feature flags and configuration
export interface StoreConfig {
  storeEnabled: boolean;
  storeName: string;
  b2bChannelId: number;
  countriesList: any[];
  multiStorefrontEnabled: boolean;
}

export interface QuoteConfig {
  productQuoteEnabled: boolean;
  cartQuoteEnabled: boolean;
  shoppingListEnabled: boolean;
  registerEnabled: boolean;
  quoteConfig: any[];
}

export interface OpenAPPParams {
  quoteBtn: string;
  shoppingListBtn: string;
}

export interface TipMessage {
  [key: string]: string;
}

// Global state interface (matching BigCommerce's structure)
export interface GlobalState {
  // UI State
  isCheckout: boolean;
  isCloseGotoBCHome: boolean;
  showPageMask: boolean;
  
  // User State
  isAgenting: boolean;
  isCompanyAccount: boolean;
  
  // Store Configuration
  logo: string;
  bcLanguage: string;
  storeEnabled: boolean;
  storeName: string;
  b2bChannelId: number;
  countriesList: any[];
  multiStorefrontEnabled: boolean;
  
  // Feature Flags
  productQuoteEnabled: boolean;
  cartQuoteEnabled: boolean;
  shoppingListEnabled: boolean;
  registerEnabled: boolean;
  quoteConfig: any[];
  
  // Application State
  openAPPParams: OpenAPPParams;
  enteredInclusiveTax: boolean;
  blockPendingAccountOrderCreation: boolean;
  quoteDetailHasNewMessages: boolean;
  shoppingListClickNode: any;
  tipMessage: TipMessage;
}

// Action types for state management
export type GlobalAction =
  | { type: 'SET_STORE_CONFIG'; payload: Partial<StoreConfig> }
  | { type: 'SET_QUOTE_CONFIG'; payload: Partial<QuoteConfig> }
  | { type: 'SET_UI_STATE'; payload: Partial<Pick<GlobalState, 'isCheckout' | 'isCloseGotoBCHome' | 'showPageMask'>> }
  | { type: 'SET_USER_STATE'; payload: Partial<Pick<GlobalState, 'isAgenting' | 'isCompanyAccount'>> }
  | { type: 'SET_FEATURE_FLAGS'; payload: Partial<Pick<GlobalState, 'productQuoteEnabled' | 'cartQuoteEnabled' | 'shoppingListEnabled' | 'registerEnabled'>> }
  | { type: 'SET_APP_STATE'; payload: Partial<Pick<GlobalState, 'openAPPParams' | 'enteredInclusiveTax' | 'blockPendingAccountOrderCreation' | 'quoteDetailHasNewMessages' | 'shoppingListClickNode' | 'tipMessage'>> }
  | { type: 'RESET_STATE' };

// Initial state (matching BigCommerce's structure)
const initialState: GlobalState = {
  // UI State
  isCheckout: false,
  isCloseGotoBCHome: false,
  showPageMask: false,
  
  // User State
  isAgenting: false,
  isCompanyAccount: false,
  
  // Store Configuration
  logo: '',
  bcLanguage: 'en',
  storeEnabled: false,
  storeName: '',
  b2bChannelId: 1,
  countriesList: [],
  multiStorefrontEnabled: false,
  
  // Feature Flags
  productQuoteEnabled: false,
  cartQuoteEnabled: false,
  shoppingListEnabled: false,
  registerEnabled: true,
  quoteConfig: [],
  
  // Application State
  openAPPParams: {
    quoteBtn: '',
    shoppingListBtn: '',
  },
  enteredInclusiveTax: false,
  blockPendingAccountOrderCreation: true,
  quoteDetailHasNewMessages: false,
  shoppingListClickNode: null,
  tipMessage: {},
};

// Reducer for state management
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_STORE_CONFIG':
      return { ...state, ...action.payload };
    case 'SET_QUOTE_CONFIG':
      return { ...state, ...action.payload };
    case 'SET_UI_STATE':
      return { ...state, ...action.payload };
    case 'SET_USER_STATE':
      return { ...state, ...action.payload };
    case 'SET_FEATURE_FLAGS':
      return { ...state, ...action.payload };
    case 'SET_APP_STATE':
      return { ...state, ...action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context creation
const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  updateFeatureFlags: (userRole: CustomerRole, companyStatus: CompanyStatus, permissions: string[]) => void;
} | null>(null);

// Provider component
interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const auth = useB2BAuth();

  // Update feature flags based on user role and permissions
  const updateFeatureFlags = (
    userRole: CustomerRole,
    companyStatus: CompanyStatus,
    permissions: string[]
  ) => {
    const isB2BUser = auth.isB2BUser();
    const isAgenting = auth.isMasquerading();

    // Check specific permissions
    const hasQuoteCreatePermission = permissions.includes('quotes_create') || permissions.includes('quotesCreateActions');
    const hasShoppingListPermission = permissions.includes('shopping_list_create') || permissions.includes('shoppingListCreateActions');

    // Determine feature flags based on BigCommerce's logic
    const featureFlags = {
      productQuoteEnabled: isB2BUser 
        ? state.productQuoteEnabled && hasQuoteCreatePermission 
        : state.productQuoteEnabled,
      cartQuoteEnabled: isB2BUser 
        ? state.cartQuoteEnabled && hasQuoteCreatePermission 
        : state.cartQuoteEnabled,
      shoppingListEnabled: isB2BUser 
        ? state.shoppingListEnabled && hasShoppingListPermission 
        : state.shoppingListEnabled,
      registerEnabled: state.registerEnabled,
    };

    dispatch({ type: 'SET_FEATURE_FLAGS', payload: featureFlags });

    // Update user state
    dispatch({ 
      type: 'SET_USER_STATE', 
      payload: { 
        isAgenting,
        isCompanyAccount: isB2BUser 
      } 
    });
  };

  // Auto-update feature flags when authentication changes
  React.useEffect(() => {
    if (auth.userContext) {
      updateFeatureFlags(
        auth.userContext.role,
        auth.userContext.companyStatus,
        auth.getPermissions().map(p => p.code)
      );
    }
  }, [auth.userContext, auth.isAuthenticated]);

  return (
    <GlobalContext.Provider value={{ state, dispatch, updateFeatureFlags }}>
      {children}
    </GlobalContext.Provider>
  );
}

// Hook for using the global context
export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}

// Utility hooks for specific state access
export function useStoreConfig() {
  const { state } = useGlobalContext();
  return {
    storeEnabled: state.storeEnabled,
    storeName: state.storeName,
    b2bChannelId: state.b2bChannelId,
    countriesList: state.countriesList,
    multiStorefrontEnabled: state.multiStorefrontEnabled,
  };
}

export function useFeatureFlags() {
  const { state } = useGlobalContext();
  return {
    productQuoteEnabled: state.productQuoteEnabled,
    cartQuoteEnabled: state.cartQuoteEnabled,
    shoppingListEnabled: state.shoppingListEnabled,
    registerEnabled: state.registerEnabled,
  };
}

export function useUIState() {
  const { state, dispatch } = useGlobalContext();
  return {
    isCheckout: state.isCheckout,
    isCloseGotoBCHome: state.isCloseGotoBCHome,
    showPageMask: state.showPageMask,
    setCheckout: (isCheckout: boolean) => 
      dispatch({ type: 'SET_UI_STATE', payload: { isCheckout } }),
    setPageMask: (showPageMask: boolean) => 
      dispatch({ type: 'SET_UI_STATE', payload: { showPageMask } }),
  };
}

export function useUserState() {
  const { state } = useGlobalContext();
  return {
    isAgenting: state.isAgenting,
    isCompanyAccount: state.isCompanyAccount,
  };
} 