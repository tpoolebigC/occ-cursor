/**
 * B2B GraphQL - Catalog, Pricing, and Inventory Queries
 *
 * Company-specific pricing, bulk pricing tiers, inventory,
 * product validation, purchasability checks, and tax zones.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BPriceRange {
  min: string;
  max: string;
}

export interface B2BBulkPricing {
  minimumQuantity: number;
  maximumQuantity: number;
  discountType: string;
  discountAmount: string;
}

export interface B2BProductPrice {
  basePrice: string;
  salePrice: string;
  retailPrice: string;
  priceRange: B2BPriceRange;
  bulkPricing: B2BBulkPricing[];
  currencyCode: string;
}

export interface B2BProductInventory {
  productId: number;
  variantId: number;
  inventoryLevel: number;
  inventoryWarningLevel: number;
  isInStock: boolean;
}

export interface B2BCatalogVariant {
  variantId: number;
  variantSku: string;
  productId: number;
  price: string;
  salePrice: string;
  retailPrice: string;
  imageUrl: string;
  inventoryLevel: number;
  isInStock: boolean;
  options: Array<{ optionName: string; optionValue: string }>;
}

export interface B2BProductValidation {
  productId: number;
  variantId: number;
  isValid: boolean;
  isPurchasable: boolean;
  message: string;
  minQuantity: number;
  maxQuantity: number;
}

export interface B2BTaxZoneRate {
  id: number;
  name: string;
  rate: string;
  priority: number;
  classRates: Array<{ taxClassId: number; rate: string }>;
}

export interface B2BPriceDisplaySettings {
  showInclusiveTaxPrice: boolean;
  showExclusiveTaxPrice: boolean;
  defaultTaxLabel: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const PRODUCT_PRICING_QUERY = `
  query ProductPricing($items: [PricingProductItemInputType]!) {
    pricingProducts(items: $items) {
      productId
      variantId
      basePrice
      salePrice
      retailPrice
      priceRange {
        min
        max
      }
      bulkPricing {
        minimumQuantity
        maximumQuantity
        discountType
        discountAmount
      }
      currencyCode
    }
  }
`;

const PRODUCT_INVENTORY_QUERY = `
  query ProductInventory($items: [ProductInventoryInputType]!) {
    productInventory(items: $items) {
      productId
      variantId
      inventoryLevel
      inventoryWarningLevel
      isInStock
    }
  }
`;

const CATALOG_VARIANTS_QUERY = `
  query CatalogVariants($productId: Int!) {
    catalogVariants(productId: $productId) {
      variantId
      variantSku
      productId
      price
      salePrice
      retailPrice
      imageUrl
      inventoryLevel
      isInStock
      options {
        optionName
        optionValue
      }
    }
  }
`;

const VALIDATE_PRODUCTS_QUERY = `
  query ValidateProducts($items: [ValidateProductInputType]!) {
    validateProducts(items: $items) {
      productId
      variantId
      isValid
      isPurchasable
      message
      minQuantity
      maxQuantity
    }
  }
`;

const TAX_ZONE_RATES_QUERY = `
  query TaxZoneRates {
    taxZoneRates {
      id
      name
      rate
      priority
      classRates {
        taxClassId
        rate
      }
    }
  }
`;

const PRICE_DISPLAY_SETTINGS_QUERY = `
  query PriceDisplaySettings {
    priceDisplaySettings {
      showInclusiveTaxPrice
      showExclusiveTaxPrice
      defaultTaxLabel
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

/**
 * Get company-specific pricing for products (includes bulk pricing tiers).
 */
export async function getProductPricing(
  items: Array<{
    productId: number;
    variantId?: number;
    options?: Array<{ optionId: number; optionValue: string }>;
  }>,
) {
  const data = await b2bGraphQL<{ pricingProducts: B2BProductPrice[] }>(
    PRODUCT_PRICING_QUERY,
    { items },
  );
  return data.pricingProducts;
}

/**
 * Check inventory levels for products.
 */
export async function getProductInventory(
  items: Array<{ productId: number; variantId?: number }>,
) {
  const data = await b2bGraphQL<{ productInventory: B2BProductInventory[] }>(
    PRODUCT_INVENTORY_QUERY,
    { items },
  );
  return data.productInventory;
}

/**
 * Get all variants for a product with pricing and inventory.
 */
export async function getCatalogVariants(productId: number) {
  const data = await b2bGraphQL<{ catalogVariants: B2BCatalogVariant[] }>(
    CATALOG_VARIANTS_QUERY,
    { productId },
  );
  return data.catalogVariants;
}

/**
 * Validate products for purchasability (quantity limits, availability).
 */
export async function validateProducts(
  items: Array<{ productId: number; variantId?: number; quantity: number }>,
) {
  const data = await b2bGraphQL<{ validateProducts: B2BProductValidation[] }>(
    VALIDATE_PRODUCTS_QUERY,
    { items },
  );
  return data.validateProducts;
}

export async function getTaxZoneRates() {
  const data = await b2bGraphQL<{ taxZoneRates: B2BTaxZoneRate[] }>(TAX_ZONE_RATES_QUERY);
  return data.taxZoneRates;
}

export async function getPriceDisplaySettings() {
  const data = await b2bGraphQL<{ priceDisplaySettings: B2BPriceDisplaySettings }>(
    PRICE_DISPLAY_SETTINGS_QUERY,
  );
  return data.priceDisplaySettings;
}
