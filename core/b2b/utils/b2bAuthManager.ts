/**
 * B2B Authentication Manager
 * 
 * This module handles the complete B2B authentication flow and user context management
 * for a production-ready B2B buyer portal within the Catalyst codebase.
 * 
 * Uses only gql-tada and Catalyst patterns - no external B2B dependencies.
 */

import { auth } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

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
  currentCustomerJWT: string;
  
  // B2B specific
  isB2BUser: boolean;
}

// Authentication State
export interface B2BAuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  userContext: B2BUserContext | null;
  error: string | null;
  source: 'API' | 'Manual' | 'None';
  isLoading: boolean;
}

// GraphQL query for customer info
const GET_CUSTOMER_INFO = graphql(`
  query GetCustomerInfo {
    customer {
      entityId
      email
      firstName
      lastName
      company
      customerGroupId
      addresses {
        edges {
          node {
            entityId
            firstName
            lastName
            company
            address1
            address2
            city
            stateOrProvince
            countryCode
            postalCode
          }
        }
      }
    }
  }
`);

class B2BAuthManager {
  private state: B2BAuthState = {
    isAuthenticated: false,
    isInitialized: false,
    userContext: null,
    error: null,
    source: 'None',
    isLoading: false,
  };

  private listeners: Array<(state: B2BAuthState) => void> = [];
  private initializationPromise: Promise<B2BAuthState> | null = null;

  // Initialize the B2B authentication system
  async initialize(): Promise<B2BAuthState> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<B2BAuthState> {
    try {
      this.updateState({
        ...this.state,
        isLoading: true,
        error: null,
      });

      console.log('🔐 [B2B Auth] Starting initialization...');

      // Step 1: Try API-based authentication (preferred method)
      const apiResult = await this.tryAPIAuth();
      if (apiResult.isAuthenticated) {
        console.log('✅ [B2B Auth] API authentication successful');
        return apiResult;
      }

      // Step 2: Try manual authentication as fallback
      const manualResult = await this.tryManualAuth();
      if (manualResult.isAuthenticated) {
        console.log('✅ [B2B Auth] Manual authentication successful');
        return manualResult;
      }

      // Step 3: No authentication available
      console.log('⚠️ [B2B Auth] No authentication available');
      const finalState: B2BAuthState = {
        isAuthenticated: false,
        isInitialized: true,
        userContext: null,
        error: 'No authentication available',
        source: 'None',
        isLoading: false,
      };

      this.updateState(finalState);
      return finalState;
    } catch (error) {
      console.error('❌ [B2B Auth] Initialization error:', error);
      const errorState: B2BAuthState = {
        isAuthenticated: false,
        isInitialized: true,
        userContext: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'None',
        isLoading: false,
      };

      this.updateState(errorState);
      return errorState;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async tryAPIAuth(): Promise<B2BAuthState> {
    try {
      const session = await auth();
      
      if (!session?.user?.customerAccessToken) {
        return {
          ...this.state,
          isAuthenticated: false,
          error: 'No customer access token available',
          source: 'API',
        };
      }

      // Fetch customer info using gql-tada
      const response = await client.fetch({
        document: GET_CUSTOMER_INFO,
        customerAccessToken: session.user.customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      const customer = response.data?.customer;
      if (!customer) {
        return {
          ...this.state,
          isAuthenticated: false,
          error: 'No customer data available',
          source: 'API',
        };
      }

      // Determine if this is a B2B user based on company info
      const isB2BUser = !!customer.company || customer.customerGroupId !== undefined;
      
      // Create user context
      const userContext: B2BUserContext = {
        userId: customer.entityId,
        email: customer.email,
        firstName: customer.firstName || undefined,
        lastName: customer.lastName || undefined,
        role: isB2BUser ? CustomerRole.ADMIN : CustomerRole.B2C,
        permissions: this.getDefaultPermissions(isB2BUser),
        userType: isB2BUser ? UserTypes.MULTIPLE_B2C : UserTypes.SINGLE_B2C,
        companyId: customer.entityId, // Using customer ID as company ID for now
        companyName: customer.company || 'Personal Account',
        companyStatus: isB2BUser ? CompanyStatus.APPROVED : CompanyStatus.DEFAULT,
        companyInfo: {
          id: customer.entityId,
          name: customer.company || 'Personal Account',
          status: isB2BUser ? CompanyStatus.APPROVED : CompanyStatus.DEFAULT,
          customerGroupId: customer.customerGroupId,
        },
        bcGraphqlToken: session.user.customerAccessToken,
        currentCustomerJWT: session.user.customerAccessToken,
        isB2BUser,
      };

      return {
        isAuthenticated: true,
        isInitialized: true,
        userContext,
        error: null,
        source: 'API',
        isLoading: false,
      };
    } catch (error) {
      console.error('❌ [B2B Auth] API authentication error:', error);
      return {
        ...this.state,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'API authentication failed',
        source: 'API',
      };
    }
  }

  private async tryManualAuth(): Promise<B2BAuthState> {
    try {
      // For manual auth, we'll create a basic B2C user context
      const userContext: B2BUserContext = {
        userId: 0,
        email: 'guest@example.com',
        role: CustomerRole.B2C,
        permissions: this.getDefaultPermissions(false),
        userType: UserTypes.SINGLE_B2C,
        companyId: 0,
        companyName: 'Guest Account',
        companyStatus: CompanyStatus.DEFAULT,
        companyInfo: {
          id: 0,
          name: 'Guest Account',
          status: CompanyStatus.DEFAULT,
        },
        bcGraphqlToken: '',
        currentCustomerJWT: '',
        isB2BUser: false,
      };

      return {
        isAuthenticated: false,
        isInitialized: true,
        userContext,
        error: 'Manual authentication - limited access',
        source: 'Manual',
        isLoading: false,
      };
    } catch (error) {
      console.error('❌ [B2B Auth] Manual authentication error:', error);
      return {
        ...this.state,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Manual authentication failed',
        source: 'Manual',
      };
    }
  }

  private getDefaultPermissions(isB2BUser: boolean): Permission[] {
    if (isB2BUser) {
      return [
        { code: 'orders', permissionLevel: 3 },
        { code: 'quotes', permissionLevel: 3 },
        { code: 'invoices', permissionLevel: 3 },
        { code: 'quick_order', permissionLevel: 3 },
        { code: 'shopping_lists', permissionLevel: 2 },
        { code: 'addresses', permissionLevel: 2 },
      ];
    } else {
      return [
        { code: 'orders', permissionLevel: 1 },
        { code: 'quotes', permissionLevel: 0 },
        { code: 'invoices', permissionLevel: 0 },
        { code: 'quick_order', permissionLevel: 1 },
        { code: 'shopping_lists', permissionLevel: 0 },
        { code: 'addresses', permissionLevel: 1 },
      ];
    }
  }

  private updateState(newState: B2BAuthState): void {
    this.state = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  getState(): B2BAuthState {
    return this.state;
  }

  subscribe(listener: (state: B2BAuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async reauthenticate(): Promise<B2BAuthState> {
    this.initializationPromise = null;
    return this.initialize();
  }

  hasPermission(permissionCode: string, requiredLevel: number = 1): boolean {
    if (!this.state.userContext) {
      return false;
    }

    const permission = this.state.userContext.permissions.find(
      p => p.code === permissionCode
    );

    return permission ? permission.permissionLevel >= requiredLevel : false;
  }

  isB2BUser(): boolean {
    return this.state.userContext?.isB2BUser || false;
  }

  getCompanyInfo(): CompanyInfo | null {
    return this.state.userContext?.companyInfo || null;
  }

  logout(): void {
    this.updateState({
      isAuthenticated: false,
      isInitialized: true,
      userContext: null,
      error: null,
      source: 'None',
      isLoading: false,
    });
  }
}

// Singleton instance
const b2bAuthManager = new B2BAuthManager();

// Public API
export const initializeB2BAuth = () => b2bAuthManager.initialize();
export const getB2BAuthState = () => b2bAuthManager.getState();
export const subscribeToB2BAuth = (listener: (state: B2BAuthState) => void) => b2bAuthManager.subscribe(listener);
export const reauthenticateB2B = () => b2bAuthManager.reauthenticate();
export const logoutB2B = () => b2bAuthManager.logout();
export const hasB2BPermission = (code: string, level: number = 1) => b2bAuthManager.hasPermission(code, level);
export const isB2BUser = () => b2bAuthManager.isB2BUser();
export const getB2BCompanyInfo = () => b2bAuthManager.getCompanyInfo(); 