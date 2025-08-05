/**
 * B2B Authentication Manager
 * 
 * This module handles the complete B2B authentication flow and user context management
 * for a production-ready B2B buyer portal within the Catalyst codebase.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture and B3Storage integration.
 */

// User Role Hierarchy (matching BigCommerce's implementation)
export enum CustomerRole {
  B2C = 0,           // Standard customer
  ADMIN = 1,         // Company admin
  SENIOR_BUYER = 2,  // Senior buyer
  JUNIOR_BUYER = 3,  // Junior buyer
  CUSTOM_ROLE = 4,   // Custom role
  SUPER_ADMIN = 100  // System admin
}

// Company Status Codes (matching BigCommerce's implementation)
export enum CompanyStatus {
  PENDING = 0,   // Newly registered companies awaiting approval
  APPROVED = 1,  // Companies with full access to B2B features
  REJECTED = 2,  // Companies that have been rejected
  INACTIVE = 3,  // Companies that are temporarily inactive
  DELETED = 4,   // Companies that have been removed
  DEFAULT = 99   // Default status (distinguishes B2C from B2B)
}

// User Types
export enum UserTypes {
  MULTIPLE_B2C = 'MULTIPLE_B2C',
  SINGLE_B2C = 'SINGLE_B2C'
}

// Permission Structure
export interface Permission {
  code: string;           // Feature identifier
  permissionLevel: number; // Access level (0-3)
}

// Company Information
export interface CompanyInfo {
  id: number;
  name: string;
  status: CompanyStatus;
  customerGroupId?: number;
  subsidiaries?: CompanyInfo[];
}

// Masquerading Information
export interface MasqueradeCompany {
  id: number;
  isAgenting: boolean;
  companyName: string;
  customerGroupId: number;
}

// User Context (matching BigCommerce's structure)
export interface B2BUserContext {
  // Basic user info
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  
  // Role and permissions
  role: CustomerRole;
  permissions: Permission[];
  userType: UserTypes;
  
  // Company information
  companyId: number;
  companyName: string;
  companyStatus: CompanyStatus;
  companyInfo: CompanyInfo;
  
  // Authentication tokens
  bcGraphqlToken: string;
  b2bToken: string;
  currentCustomerJWT: string;
  
  // B2B specific
  isB2BUser: boolean;
  isAgenting: boolean;
  masqueradeCompany?: MasqueradeCompany;
  
  // B3Storage data (when available)
  b3StorageData?: any;
}

// Authentication State
export interface B2BAuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  userContext: B2BUserContext | null;
  error: string | null;
  source: 'B3Storage' | 'API' | 'Manual' | 'None';
  isLoading: boolean;
}

class B2BAuthManager {
  private state: B2BAuthState = {
    isAuthenticated: false,
    isInitialized: false,
    userContext: null,
    error: null,
    source: 'None',
    isLoading: false
  };

  private listeners: Array<(state: B2BAuthState) => void> = [];
  private initializationPromise: Promise<B2BAuthState> | null = null;

  /**
   * Initialize B2B authentication (matching BigCommerce's flow)
   */
  async initialize(): Promise<B2BAuthState> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<B2BAuthState> {
    try {
      this.updateState({ ...this.state, isLoading: true });
      console.log('B2B Auth Manager: Starting initialization...');
      
      // Step 1: Wait for B2B script to load
      await this.waitForB2BScript();
      
      // Step 2: Try B3Storage first (preferred method)
      const b3StorageResult = await this.tryB3StorageAuth();
      if (b3StorageResult.isAuthenticated) {
        this.updateState(b3StorageResult);
        return b3StorageResult;
      }
      
      // Step 3: Fallback to API-based authentication
      const apiResult = await this.tryAPIAuth();
      if (apiResult.isAuthenticated) {
        this.updateState(apiResult);
        return apiResult;
      }
      
      // Step 4: Manual authentication if needed
      const manualResult = await this.tryManualAuth();
      this.updateState(manualResult);
      return manualResult;
      
    } catch (error) {
      const errorState: B2BAuthState = {
        isAuthenticated: false,
        isInitialized: true,
        userContext: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'None',
        isLoading: false
      };
      this.updateState(errorState);
      return errorState;
    }
  }

  /**
   * Wait for B2B script to be fully loaded
   */
  private async waitForB2BScript(timeoutMs: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if ((window as any).b2b && (window as any).B3) {
        console.log('B2B Auth Manager: B2B script loaded');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('B2B script failed to load within timeout');
  }

  /**
   * Try to authenticate using B3Storage (preferred method)
   */
  private async tryB3StorageAuth(): Promise<B2BAuthState> {
    try {
      console.log('B2B Auth Manager: Attempting B3Storage authentication...');
      
      // Wait for B3Storage to become available
      const b3Data = await this.waitForB3Storage(5000);
      
      if (!b3Data.B3B2BToken || !b3Data.B3UserId) {
        throw new Error('B3Storage missing required authentication data');
      }

      // Build user context matching BigCommerce's structure
      const userContext: B2BUserContext = {
        // Basic user info
        userId: b3Data.B3UserId,
        email: b3Data.B3Email || '',
        firstName: b3Data.B3CompanyInfo?.firstName,
        lastName: b3Data.B3CompanyInfo?.lastName,
        
        // Role and permissions
        role: this.mapB3RoleToCustomerRole(b3Data.B3RoleId),
        permissions: this.parseB3Permissions(b3Data.B3AppPermissions),
        userType: UserTypes.MULTIPLE_B2C,
        
        // Company information
        companyId: b3Data.B3CompanyId || 0,
        companyName: b3Data.B3CompanyName || '',
        companyStatus: this.mapB3StatusToCompanyStatus(b3Data.B3CompanyStatus),
        companyInfo: {
          id: b3Data.B3CompanyId || 0,
          name: b3Data.B3CompanyName || '',
          status: this.mapB3StatusToCompanyStatus(b3Data.B3CompanyStatus),
          customerGroupId: b3Data.B3CompanyInfo?.customerGroupId
        },
        
        // Authentication tokens
        bcGraphqlToken: b3Data.B3B2BToken, // Using B2B token as GraphQL token
        b2bToken: b3Data.B3B2BToken,
        currentCustomerJWT: b3Data.B3B2BToken,
        
        // B2B specific
        isB2BUser: !b3Data.B3IsB2CUser,
        isAgenting: b3Data.B3isSetSalesRep || false,
        
        // B3Storage data
        b3StorageData: b3Data
      };

      console.log('B2B Auth Manager: B3Storage authentication successful', userContext);
      
      return {
        isAuthenticated: true,
        isInitialized: true,
        userContext,
        error: null,
        source: 'B3Storage',
        isLoading: false
      };
      
    } catch (error) {
      console.log('B2B Auth Manager: B3Storage authentication failed:', error);
      return {
        isAuthenticated: false,
        isInitialized: false,
        userContext: null,
        error: error instanceof Error ? error.message : 'B3Storage auth failed',
        source: 'B3Storage',
        isLoading: false
      };
    }
  }

  /**
   * Map B3Storage role ID to BigCommerce CustomerRole
   */
  private mapB3RoleToCustomerRole(b3RoleId: number): CustomerRole {
    // This mapping should be configured based on your B2B setup
    switch (b3RoleId) {
      case 1: return CustomerRole.ADMIN;
      case 2: return CustomerRole.SENIOR_BUYER;
      case 3: return CustomerRole.JUNIOR_BUYER;
      case 100: return CustomerRole.SUPER_ADMIN;
      default: return CustomerRole.B2C;
    }
  }

  /**
   * Map B3Storage status to BigCommerce CompanyStatus
   */
  private mapB3StatusToCompanyStatus(b3Status: any): CompanyStatus {
    // This mapping should be configured based on your B2B setup
    if (b3Status === 'APPROVED') return CompanyStatus.APPROVED;
    if (b3Status === 'PENDING') return CompanyStatus.PENDING;
    if (b3Status === 'REJECTED') return CompanyStatus.REJECTED;
    if (b3Status === 'INACTIVE') return CompanyStatus.INACTIVE;
    if (b3Status === 'DELETED') return CompanyStatus.DELETED;
    return CompanyStatus.DEFAULT;
  }

  /**
   * Parse B3Storage permissions into BigCommerce format
   */
  private parseB3Permissions(b3Permissions: any): Permission[] {
    if (!b3Permissions || typeof b3Permissions !== 'object') {
      return [];
    }

    const permissions: Permission[] = [];
    
    Object.entries(b3Permissions).forEach(([code, level]) => {
      permissions.push({
        code,
        permissionLevel: typeof level === 'number' ? level : 0
      });
    });

    return permissions;
  }

  /**
   * Try to authenticate using API calls (fallback method)
   */
  private async tryAPIAuth(): Promise<B2BAuthState> {
    try {
      console.log('B2B Auth Manager: Attempting API-based authentication...');
      
      // This would use the existing server actions
      // For now, return not authenticated to force manual auth
      return {
        isAuthenticated: false,
        isInitialized: false,
        userContext: null,
        error: 'API authentication not implemented',
        source: 'API',
        isLoading: false
      };
      
    } catch (error) {
      console.log('B2B Auth Manager: API authentication failed:', error);
      return {
        isAuthenticated: false,
        isInitialized: false,
        userContext: null,
        error: error instanceof Error ? error.message : 'API auth failed',
        source: 'API',
        isLoading: false
      };
    }
  }

  /**
   * Try manual authentication (last resort)
   */
  private async tryManualAuth(): Promise<B2BAuthState> {
    try {
      console.log('B2B Auth Manager: Attempting manual authentication...');
      
      // Trigger manual B2B initialization
      this.triggerManualB2BInit();
      
      // Wait a bit for manual initialization
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try B3Storage again after manual init
      const b3StorageResult = await this.tryB3StorageAuth();
      if (b3StorageResult.isAuthenticated) {
        return b3StorageResult;
      }
      
      return {
        isAuthenticated: false,
        isInitialized: true,
        userContext: null,
        error: 'Manual authentication failed - user may need to log in again',
        source: 'Manual',
        isLoading: false
      };
      
    } catch (error) {
      console.log('B2B Auth Manager: Manual authentication failed:', error);
      return {
        isAuthenticated: false,
        isInitialized: true,
        userContext: null,
        error: error instanceof Error ? error.message : 'Manual auth failed',
        source: 'Manual',
        isLoading: false
      };
    }
  }

  /**
   * Wait for B3Storage to become available
   */
  private async waitForB3Storage(timeoutMs: number): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const b3Storage = (window as any).B3Storage;
        if (b3Storage) {
          const data: any = {};
          Object.keys(b3Storage).forEach(key => {
            try {
              const value = b3Storage[key];
              if (value && typeof value === 'object' && 'value' in value) {
                data[key] = value.value;
              } else {
                data[key] = value;
              }
            } catch (err) {
              console.warn(`Error accessing B3Storage.${key}:`, err);
            }
          });
          
          if (data.B3B2BToken && data.B3UserId) {
            return data;
          }
        }
      } catch (error) {
        console.warn('Error checking B3Storage:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('B3Storage not available within timeout');
  }

  /**
   * Trigger manual B2B initialization
   */
  private triggerManualB2BInit(): void {
    console.log('B2B Auth Manager: Triggering manual B2B initialization...');
    
    // Try multiple initialization methods
    if ((window as any).b2b?.init) {
      (window as any).b2b.init();
    }
    
    if ((window as any).b2b?.utils?.user?.init) {
      (window as any).b2b.utils.user.init();
    }
    
    // Dispatch custom events
    window.dispatchEvent(new CustomEvent('b2b-init-request'));
    window.dispatchEvent(new CustomEvent('b2b-auth-request'));
    window.dispatchEvent(new CustomEvent('b2b-user-context-request'));
    
    // Try to trigger cart creation
    if ((window as any).b2bDebug?.triggerCartCreated) {
      (window as any).b2bDebug.triggerCartCreated();
    }
  }

  /**
   * Update authentication state and notify listeners
   */
  private updateState(newState: B2BAuthState): void {
    this.state = newState;
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current authentication state
   */
  getState(): B2BAuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to authentication state changes
   */
  subscribe(listener: (state: B2BAuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Force re-authentication
   */
  async reauthenticate(): Promise<B2BAuthState> {
    this.initializationPromise = null;
    return this.initialize();
  }

  /**
   * Check if user has specific permission (matching BigCommerce's validation)
   */
  hasPermission(permissionCode: string, requiredLevel: number = 1): boolean {
    if (!this.state.userContext?.permissions) {
      return false;
    }
    
    const permission = this.state.userContext.permissions.find(p => p.code === permissionCode);
    return permission ? permission.permissionLevel >= requiredLevel : false;
  }

  /**
   * Check if user is B2B user (matching BigCommerce's logic)
   */
  isB2BUser(): boolean {
    const { userContext } = this.state;
    if (!userContext) return false;
    
    return (
      (userContext.userType === UserTypes.MULTIPLE_B2C &&
       userContext.companyStatus === CompanyStatus.APPROVED) ||
      userContext.role === CustomerRole.SUPER_ADMIN
    );
  }

  /**
   * Get user's company information
   */
  getCompanyInfo(): CompanyInfo | null {
    return this.state.userContext?.companyInfo || null;
  }

  /**
   * Check if user is masquerading
   */
  isMasquerading(): boolean {
    return this.state.userContext?.isAgenting || false;
  }

  /**
   * Get masquerading company info
   */
  getMasqueradeCompany(): MasqueradeCompany | null {
    return this.state.userContext?.masqueradeCompany || null;
  }

  /**
   * Logout and clear authentication state (matching BigCommerce's logout)
   */
  logout(): void {
    // Clear all tokens and state
    this.updateState({
      isAuthenticated: false,
      isInitialized: true,
      userContext: null,
      error: null,
      source: 'None',
      isLoading: false
    });
    
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('b2b_token');
      sessionStorage.removeItem('b2b_token');
    }
  }
}

// Export singleton instance
export const b2bAuthManager = new B2BAuthManager();

// Export utility functions for easy access
export const initializeB2BAuth = () => b2bAuthManager.initialize();
export const getB2BAuthState = () => b2bAuthManager.getState();
export const subscribeToB2BAuth = (listener: (state: B2BAuthState) => void) => b2bAuthManager.subscribe(listener);
export const reauthenticateB2B = () => b2bAuthManager.reauthenticate();
export const logoutB2B = () => b2bAuthManager.logout();
export const hasB2BPermission = (code: string, level: number = 1) => b2bAuthManager.hasPermission(code, level);
export const isB2BUser = () => b2bAuthManager.isB2BUser();
export const getB2BCompanyInfo = () => b2bAuthManager.getCompanyInfo();
export const isB2BMasquerading = () => b2bAuthManager.isMasquerading();
export const getB2BMasqueradeCompany = () => b2bAuthManager.getMasqueradeCompany(); 