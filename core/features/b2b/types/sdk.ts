// B2B SDK Types
// Type definitions for the B2B SDK utilities and callbacks

import type { B2BProfile, QuoteConfigProps, LineItem } from './index';

export interface B2BUtils {
  openPage: (page: string) => void;
  user: {
    loginWithB2BStorefrontToken: (token: string) => Promise<void>;
    getProfile: () => B2BProfile;
    getB2BToken: () => string;
  };
  customer?: {
    getCustomer: (customerId: string) => Promise<any>;
    updateCustomer: (customerId: string, data: any) => Promise<any>;
    getCompany: (customerId: string) => Promise<any>;
  };
  quote?: {
    getQuoteConfigs: () => QuoteConfigProps[];
    addProductsFromCartId: (cartId: string) => Promise<void>;
    addProducts: (products: LineItem[]) => Promise<void>;
    getQuotes: (customerId: string, params?: any) => Promise<any[]>;
    getQuote: (quoteId: string) => Promise<any>;
    createQuote: (customerId: string, data: any) => Promise<any>;
    updateQuote: (quoteId: string, data: any) => Promise<any>;
    addItems: (quoteId: string, items: any[]) => Promise<any>;
  };
  order?: {
    getOrders: (customerId: string, params?: any) => Promise<any[]>;
    getOrder: (orderId: string) => Promise<any>;
    createFromQuote: (quoteId: string, data?: any) => Promise<any>;
    updateStatus: (orderId: string, status: string) => Promise<any>;
    getHistory: (customerId: string, limit?: number) => Promise<any[]>;
  };
  shoppingList?: {
    addProductFromPage: (product: LineItem) => Promise<void>;
    getLists: (customerId: string, params?: any) => Promise<any[]>;
    getList: (listId: string) => Promise<any>;
    createList: (customerId: string, data: any) => Promise<any>;
    updateList: (listId: string, data: any) => Promise<any>;
    addItems: (listId: string, items: any[]) => Promise<any>;
    removeItems: (listId: string, itemIds: string[]) => Promise<any>;
  };
  cart?: {
    getEntityId: () => string;
    setEntityId: (cartId: string) => void;
  };
}

export interface B2BCallbacks {
  addEventListener: {
    (
      event: 'on-registered',
      callback: (props: {
        data: Record<'email' | 'password' | 'landingLoginLocation', string>;
      }) => void,
    ): void;
    (event: 'on-logout', callback: (props: { data: Record<string, string> }) => void): void;
    (event: 'on-cart-created', callback: (props: { data: { cartId: string } }) => void): void;
  };
  removeEventListener: (
    event: 'on-logout' | 'on-registered' | 'on-cart-created',
    callback: unknown,
  ) => void;
  dispatchEvent: (event: string) => void;
}

export interface B2BSDK {
  utils?: B2BUtils;
  callbacks?: B2BCallbacks;
}

// Global window augmentation
declare global {
  interface Window {
    b2b?: B2BSDK;
  }
} 