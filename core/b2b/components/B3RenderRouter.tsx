/**
 * B3RenderRouter Component
 * 
 * This component handles routing management for the B2B Buyer Portal,
 * rendering routes based on user permissions and role.
 * 
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use client';

import React from 'react';
import { useB2BAuth } from '../hooks/useB2BAuth';
import { useFeatureFlags } from '../context/GlobalContext';
import { CustomerRole, CompanyStatus } from '../utils/b2bAuthManager';

// Route interface
export interface B2BRoute {
  path: string;
  component: React.ComponentType<any>;
  isMenuItem: boolean;
  requiresAuth: boolean;
  requiredRole?: CustomerRole;
  requiredPermissions?: string[];
  requiredCompanyStatus?: CompanyStatus[];
  title: string;
  icon?: string;
}

// Route configuration
const routes: B2BRoute[] = [
  // Dashboard routes
  {
    path: '/custom-dashboard',
    component: () => import('./CustomB2BDashboard').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    title: 'Dashboard',
    icon: 'dashboard',
  },
  {
    path: '/custom-dashboard/orders',
    component: () => import('../app/[locale]/(default)/custom-dashboard/orders/page').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    requiredPermissions: ['view_orders'],
    title: 'Orders',
    icon: 'orders',
  },
  {
    path: '/custom-dashboard/orders/:orderId',
    component: () => import('../app/[locale]/(default)/custom-dashboard/orders/[orderId]/page').then(m => m.default),
    isMenuItem: false,
    requiresAuth: true,
    requiredPermissions: ['view_orders'],
    title: 'Order Details',
  },
  {
    path: '/custom-dashboard/quotes',
    component: () => import('../app/[locale]/(default)/custom-dashboard/quotes/page').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    requiredPermissions: ['view_quotes'],
    title: 'Quotes',
    icon: 'quotes',
  },
  {
    path: '/custom-dashboard/quotes/:quoteId',
    component: () => import('../app/[locale]/(default)/custom-dashboard/quotes/[quoteId]/page').then(m => m.default),
    isMenuItem: false,
    requiresAuth: true,
    requiredPermissions: ['view_quotes'],
    title: 'Quote Details',
  },
  {
    path: '/custom-dashboard/invoices',
    component: () => import('../app/[locale]/(default)/custom-dashboard/invoices/page').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    requiredPermissions: ['view_invoices'],
    title: 'Invoices',
    icon: 'invoices',
  },
  {
    path: '/custom-dashboard/invoices/:invoiceId',
    component: () => import('../app/[locale]/(default)/custom-dashboard/invoices/[invoiceId]/page').then(m => m.default),
    isMenuItem: false,
    requiresAuth: true,
    requiredPermissions: ['view_invoices'],
    title: 'Invoice Details',
  },
  {
    path: '/custom-dashboard/account',
    component: () => import('../app/[locale]/(default)/custom-dashboard/account/page').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    title: 'Account',
    icon: 'account',
  },
  // Quote management routes (feature flag dependent)
  {
    path: '/custom-dashboard/quick-order',
    component: () => import('./QuickOrderModal').then(m => m.default),
    isMenuItem: false,
    requiresAuth: true,
    requiredPermissions: ['create_quotes'],
    title: 'Quick Order',
  },
  // Shopping list routes (feature flag dependent)
  {
    path: '/custom-dashboard/shopping-lists',
    component: () => import('./ShoppingLists').then(m => m.default),
    isMenuItem: true,
    requiresAuth: true,
    requiredPermissions: ['view_shopping_lists'],
    title: 'Shopping Lists',
    icon: 'shopping-lists',
  },
];

// Navigation state interface
export interface NavigationState {
  isOpen: boolean;
  openUrl: string;
  params: Record<string, any>;
}

// Navigation hook interface
export interface UseB3AppOpenReturn {
  state: NavigationState;
  setOpenPage: (url: string, params?: Record<string, any>) => void;
  closePage: () => void;
}

// Custom hook for navigation state management
export function useB3AppOpen(initialState: NavigationState): UseB3AppOpenReturn {
  const [state, setState] = React.useState<NavigationState>(initialState);

  const setOpenPage = React.useCallback((url: string, params: Record<string, any> = {}) => {
    setState({
      isOpen: true,
      openUrl: url,
      params,
    });
  }, []);

  const closePage = React.useCallback(() => {
    setState({
      isOpen: false,
      openUrl: '',
      params: {},
    });
  }, []);

  return {
    state,
    setOpenPage,
    closePage,
  };
}

// Get allowed routes based on user permissions
export function getAllowedRoutes(
  userRole: CustomerRole,
  companyStatus: CompanyStatus,
  permissions: string[],
  featureFlags: ReturnType<typeof useFeatureFlags>
): B2BRoute[] {
  return routes.filter(route => {
    // Check if route requires authentication
    if (route.requiresAuth) {
      // Check role requirements
      if (route.requiredRole && userRole !== route.requiredRole) {
        return false;
      }

      // Check company status requirements
      if (route.requiredCompanyStatus && !route.requiredCompanyStatus.includes(companyStatus)) {
        return false;
      }

      // Check permission requirements
      if (route.requiredPermissions) {
        const hasRequiredPermissions = route.requiredPermissions.every(permission =>
          permissions.includes(permission)
        );
        if (!hasRequiredPermissions) {
          return false;
        }
      }
    }

    // Check feature flags for specific routes
    if (route.path.includes('quotes') && !featureFlags.productQuoteEnabled) {
      return false;
    }

    if (route.path.includes('shopping-lists') && !featureFlags.shoppingListEnabled) {
      return false;
    }

    return true;
  });
}

// Get allowed routes without components (for external API)
export function getAllowedRoutesWithoutComponent(
  userRole: CustomerRole,
  companyStatus: CompanyStatus,
  permissions: string[],
  featureFlags: ReturnType<typeof useFeatureFlags>
): Omit<B2BRoute, 'component'>[] {
  return getAllowedRoutes(userRole, companyStatus, permissions, featureFlags).map(route => {
    const { component, ...routeWithoutComponent } = route;
    return routeWithoutComponent;
  });
}

// Main router component
interface B3RenderRouterProps {
  setOpenPage: (url: string, params?: Record<string, any>) => void;
  authorizedPages?: string[];
}

export function B3RenderRouter({ setOpenPage, authorizedPages = [] }: B3RenderRouterProps) {
  const auth = useB2BAuth();
  const featureFlags = useFeatureFlags();

  // Get user context
  const userRole = auth.getUserRole();
  const companyStatus = auth.getCompanyStatus();
  const permissions = auth.getPermissions().map(p => p.code);

  // Get allowed routes
  const allowedRoutes = React.useMemo(() => {
    if (!userRole || !companyStatus) return [];
    
    return getAllowedRoutes(userRole, companyStatus, permissions, featureFlags);
  }, [userRole, companyStatus, permissions, featureFlags]);

  // Get menu routes (for navigation)
  const menuRoutes = React.useMemo(() => {
    return allowedRoutes.filter(route => route.isMenuItem);
  }, [allowedRoutes]);

  // Render the current page based on navigation state
  const renderCurrentPage = () => {
    // This would be determined by the current URL or navigation state
    // For now, we'll render the dashboard as default
    const currentPath = '/custom-dashboard';
    const currentRoute = allowedRoutes.find(route => route.path === currentPath);

    if (!currentRoute) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600">The requested page is not available or you don't have permission to access it.</p>
          </div>
        </div>
      );
    }

    // Dynamically import and render the component
    const Component = currentRoute.component;
    return <Component setOpenPage={setOpenPage} />;
  };

  // Show loading state while authentication is in progress
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading B2B Portal...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the B2B Portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="b3-render-router">
      {/* Render the current page */}
      {renderCurrentPage()}
      
      {/* Debug information (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
          <h4 className="font-semibold mb-2">B3RenderRouter Debug</h4>
          <p><strong>User Role:</strong> {userRole}</p>
          <p><strong>Company Status:</strong> {companyStatus}</p>
          <p><strong>Permissions:</strong> {permissions.length}</p>
          <p><strong>Allowed Routes:</strong> {allowedRoutes.length}</p>
          <p><strong>Menu Routes:</strong> {menuRoutes.length}</p>
          <p><strong>Feature Flags:</strong></p>
          <ul className="ml-2">
            <li>Quotes: {featureFlags.productQuoteEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>Shopping Lists: {featureFlags.shoppingListEnabled ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Export the hook for use in other components
export { useB3AppOpen }; 