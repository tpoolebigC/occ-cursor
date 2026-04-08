/**
 * B2B GraphQL - Store Configuration Queries
 *
 * Store settings, checkout config, currencies, product settings,
 * quote config, and storefront feature flags.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BStoreBasicInfo {
  storeName: string;
  storeUrl: string;
  storeHash: string;
  storeCountry: string;
  storeLogo: string;
}

export interface B2BCurrency {
  currencyCode: string;
  currencyName: string;
  currencyExchangeRate: string;
  isDefault: boolean;
  decimalPlaces: number;
  tokenLocation: string;
  token: string;
}

export interface B2BStoreCurrencies {
  currencies: B2BCurrency[];
  channelCurrencies: B2BCurrency[];
}

export interface B2BQuoteConfig {
  switchStatus: Array<{ key: string; isEnabled: string }>;
  otherConfigs: Array<{ key: string; value: string }>;
}

export interface B2BStorefrontProductSetting {
  hidePriceFromGuests: boolean;
  showProductWeight: boolean;
  showProductDimensions: boolean;
}

export interface B2BCheckoutConfig {
  isActive: boolean;
  style: string;
}

export interface B2BStoreLimitations {
  maxCompanyUsers: number;
  maxCompanyAddresses: number;
  maxShoppingLists: number;
}

export interface B2BStoreAutoLoader {
  isEnabled: boolean;
  scriptUrl: string;
}

export interface B2BStorefrontConfig {
  enabledFeatures: string[];
  enableQuoteOnStorefront: boolean;
  enableShoppingListOnStorefront: boolean;
  enableInvoiceOnStorefront: boolean;
  enableQuickOrderPad: boolean;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const STORE_BASIC_INFO_QUERY = `
  query StoreBasicInfo {
    storeBasicInfo {
      storeName
      storeUrl
      storeHash
      storeCountry
      storeLogo
    }
  }
`;

const STORE_CURRENCIES_QUERY = `
  query StoreCurrencies {
    storeCurrencies {
      currencies {
        currencyCode
        currencyName
        currencyExchangeRate
        isDefault
        decimalPlaces
        tokenLocation
        token
      }
      channelCurrencies {
        currencyCode
        currencyName
        currencyExchangeRate
        isDefault
        decimalPlaces
        tokenLocation
        token
      }
    }
  }
`;

const QUOTE_CONFIG_QUERY = `
  query QuoteConfig {
    quoteConfig {
      switchStatus {
        key
        isEnabled
      }
      otherConfigs {
        key
        value
      }
    }
  }
`;

const STOREFRONT_PRODUCT_SETTINGS_QUERY = `
  query StorefrontProductSettings {
    storefrontProductSettings {
      hidePriceFromGuests
      showProductWeight
      showProductDimensions
    }
  }
`;

const CHECKOUT_CONFIG_QUERY = `
  query CheckoutConfig {
    checkoutConfig {
      isActive
      style
    }
  }
`;

const STORE_LIMITATIONS_QUERY = `
  query StoreLimitations {
    storeLimitations {
      maxCompanyUsers
      maxCompanyAddresses
      maxShoppingLists
    }
  }
`;

const STOREFRONT_CONFIG_QUERY = `
  query StorefrontConfig {
    storefrontConfig {
      enabledFeatures
      enableQuoteOnStorefront
      enableShoppingListOnStorefront
      enableInvoiceOnStorefront
      enableQuickOrderPad
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export async function getStoreBasicInfo() {
  const data = await b2bGraphQL<{ storeBasicInfo: B2BStoreBasicInfo }>(
    STORE_BASIC_INFO_QUERY,
  );
  return data.storeBasicInfo;
}

export async function getStoreCurrencies() {
  const data = await b2bGraphQL<{ storeCurrencies: B2BStoreCurrencies }>(
    STORE_CURRENCIES_QUERY,
  );
  return data.storeCurrencies;
}

export async function getQuoteConfig() {
  const data = await b2bGraphQL<{ quoteConfig: B2BQuoteConfig }>(QUOTE_CONFIG_QUERY);
  return data.quoteConfig;
}

export async function getStorefrontProductSettings() {
  const data = await b2bGraphQL<{
    storefrontProductSettings: B2BStorefrontProductSetting;
  }>(STOREFRONT_PRODUCT_SETTINGS_QUERY);
  return data.storefrontProductSettings;
}

export async function getCheckoutConfig() {
  const data = await b2bGraphQL<{ checkoutConfig: B2BCheckoutConfig }>(
    CHECKOUT_CONFIG_QUERY,
  );
  return data.checkoutConfig;
}

export async function getStoreLimitations() {
  const data = await b2bGraphQL<{ storeLimitations: B2BStoreLimitations }>(
    STORE_LIMITATIONS_QUERY,
  );
  return data.storeLimitations;
}

export async function getStorefrontConfig() {
  const data = await b2bGraphQL<{ storefrontConfig: B2BStorefrontConfig }>(
    STOREFRONT_CONFIG_QUERY,
  );
  return data.storefrontConfig;
}
