export interface B2BProfile {
  role: B2BRole;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export enum B2BRole {
  GUEST = 'guest',
  B2C = 'b2c',
  B2B = 'b2b',
}

export interface QuoteConfigProps {
  id: string;
  name: string;
  enabled: boolean;
}

export interface LineItem {
  productId: number;
  quantity: number;
  options?: Array<{
    optionId: number;
    value: string;
  }>;
}

declare global {
  interface Window {
    b2b?: {
      utils?: {
        openPage: (page: string) => void;
        user: {
          loginWithB2BStorefrontToken: (token: string) => Promise<void>;
          getProfile: () => B2BProfile;
          getB2BToken: () => string;
        };
        quote?: {
          getQuoteConfigs: () => QuoteConfigProps[];
          addProductsFromCartId: (cartId: string) => Promise<void>;
          addProducts: (products: LineItem[]) => Promise<void>;
        };
        shoppingList?: {
          addProductFromPage: (product: LineItem) => Promise<void>;
        };
        cart?: {
          getEntityId: () => string;
          setEntityId: (cartId: string) => void;
        };
      };
      callbacks?: {
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
      };
    };
  }
} 