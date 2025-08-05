/**
 * B2B Authentication Hook
 * 
 * React hook for managing B2B authentication state and user context.
 * Provides a clean interface for components to access B2B authentication.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

import { useState, useEffect } from 'react';
import { 
  b2bAuthManager, 
  B2BAuthState, 
  B2BUserContext,
  CustomerRole,
  CompanyStatus,
  Permission,
  CompanyInfo,
  MasqueradeCompany,
  initializeB2BAuth,
  getB2BAuthState,
  subscribeToB2BAuth,
  reauthenticateB2B,
  logoutB2B,
  hasB2BPermission,
  isB2BUser,
  getB2BCompanyInfo,
  isB2BMasquerading,
  getB2BMasqueradeCompany
} from '../utils/b2bAuthManager';

export interface UseB2BAuthReturn {
  // State
  isAuthenticated: boolean;
  isInitialized: boolean;
  userContext: B2BUserContext | null;
  error: string | null;
  source: 'B3Storage' | 'API' | 'Manual' | 'None';
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<B2BAuthState>;
  reauthenticate: () => Promise<B2BAuthState>;
  logout: () => void;
  
  // Utilities
  hasPermission: (permissionCode: string, requiredLevel?: number) => boolean;
  getCompanyInfo: () => CompanyInfo | null;
  isB2BUser: () => boolean;
  isMasquerading: () => boolean;
  getMasqueradeCompany: () => MasqueradeCompany | null;
  
  // Role and status helpers
  getUserRole: () => CustomerRole | null;
  getCompanyStatus: () => CompanyStatus | null;
  getPermissions: () => Permission[];
}

export function useB2BAuth(): UseB2BAuthReturn {
  const [state, setState] = useState<B2BAuthState>(getB2BAuthState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = subscribeToB2BAuth((newState) => {
      setState(newState);
    });

    // Initialize authentication on mount
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await initializeB2BAuth();
      } catch (error) {
        console.error('Failed to initialize B2B auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return unsubscribe;
  }, []);

  const initialize = async (): Promise<B2BAuthState> => {
    setIsLoading(true);
    try {
      const result = await initializeB2BAuth();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const reauthenticate = async (): Promise<B2BAuthState> => {
    setIsLoading(true);
    try {
      const result = await reauthenticateB2B();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    logoutB2B();
  };

  const hasPermission = (permissionCode: string, requiredLevel: number = 1): boolean => {
    return hasB2BPermission(permissionCode, requiredLevel);
  };

  const getCompanyInfo = (): CompanyInfo | null => {
    return getB2BCompanyInfo();
  };

  const isB2BUser = (): boolean => {
    return isB2BUser();
  };

  const isMasquerading = (): boolean => {
    return isB2BMasquerading();
  };

  const getMasqueradeCompany = (): MasqueradeCompany | null => {
    return getB2BMasqueradeCompany();
  };

  const getUserRole = (): CustomerRole | null => {
    return state.userContext?.role || null;
  };

  const getCompanyStatus = (): CompanyStatus | null => {
    return state.userContext?.companyStatus || null;
  };

  const getPermissions = (): Permission[] => {
    return state.userContext?.permissions || [];
  };

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    userContext: state.userContext,
    error: state.error,
    source: state.source,
    isLoading: state.isLoading || isLoading,
    
    // Actions
    initialize,
    reauthenticate,
    logout,
    
    // Utilities
    hasPermission,
    getCompanyInfo,
    isB2BUser,
    isMasquerading,
    getMasqueradeCompany,
    
    // Role and status helpers
    getUserRole,
    getCompanyStatus,
    getPermissions,
  };
}

/**
 * Hook for components that need to wait for B2B authentication
 */
export function useB2BAuthRequired(): UseB2BAuthReturn & { isReady: boolean } {
  const auth = useB2BAuth();
  
  const isReady = auth.isInitialized && auth.isAuthenticated;
  
  return {
    ...auth,
    isReady,
  };
}

/**
 * Hook for components that need B2B user context
 */
export function useB2BUserContext(): B2BUserContext | null {
  const { userContext } = useB2BAuth();
  return userContext;
}

/**
 * Hook for checking specific permissions
 */
export function useB2BPermission(permissionCode: string, requiredLevel: number = 1): boolean {
  const { hasPermission } = useB2BAuth();
  return hasPermission(permissionCode, requiredLevel);
}

/**
 * Hook for checking if user is B2B user
 */
export function useB2BUser(): boolean {
  const { isB2BUser } = useB2BAuth();
  return isB2BUser();
}

/**
 * Hook for getting user role
 */
export function useB2BUserRole(): CustomerRole | null {
  const { getUserRole } = useB2BAuth();
  return getUserRole();
}

/**
 * Hook for getting company status
 */
export function useB2BCompanyStatus(): CompanyStatus | null {
  const { getCompanyStatus } = useB2BAuth();
  return getCompanyStatus();
}

/**
 * Hook for getting all permissions
 */
export function useB2BPermissions(): Permission[] {
  const { getPermissions } = useB2BAuth();
  return getPermissions();
}

/**
 * Hook for checking if user is masquerading
 */
export function useB2BMasquerading(): boolean {
  const { isMasquerading } = useB2BAuth();
  return isMasquerading();
}

/**
 * Hook for getting masquerade company info
 */
export function useB2BMasqueradeCompany(): MasqueradeCompany | null {
  const { getMasqueradeCompany } = useB2BAuth();
  return getMasqueradeCompany();
} 