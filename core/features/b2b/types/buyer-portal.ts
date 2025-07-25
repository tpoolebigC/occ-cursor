// B2B Buyer Portal Types
// Type definitions for B2B buyer portal functionality

export interface BuyerPortalStats {
  activeOrders: number;
  monthlyRevenue: number;
  pendingQuotes: number;
  totalProducts: number;
}

export interface BuyerPortalNavigation {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: BuyerPortalNavigation[];
}

export interface BuyerPortalQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface BuyerPortalLayout {
  header: {
    title: string;
    subtitle?: string;
    actions?: BuyerPortalQuickAction[];
  };
  sidebar: BuyerPortalNavigation[];
  content: {
    title: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
  };
}

export interface BuyerPortalConfig {
  features: {
    quotes: boolean;
    orders: boolean;
    shoppingLists: boolean;
    analytics: boolean;
    catalog: boolean;
  };
  permissions: {
    canCreateQuotes: boolean;
    canViewOrders: boolean;
    canManageShoppingLists: boolean;
    canViewAnalytics: boolean;
    canBrowseCatalog: boolean;
  };
} 