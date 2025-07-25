'use client';

import { useState } from 'react';

import { useB2BQuoteEnabled } from './use-b2b-quote-enabled';
import { useB2BSDK } from './use-b2b-sdk';
import { useB2BShoppingListEnabled } from './use-b2b-shopping-list-enabled';

import { Field } from '~/vibes/soul/sections/product-detail/schema';

import { mapToB2BProductOptions } from '../utils/map-to-b2b-product-options';

interface ProductOption {
  field: Field;
  value?: string | number;
}

interface ProductData {
  productId: string;
  quantity: number;
  selectedOptions: ProductOption[];
}

/**
 * Hook for adding products to quotes
 * Provides functionality to add products to B2B quotes with loading states
 */
export const useAddToQuote = () => {
  const isQuotesEnabled = useB2BQuoteEnabled();
  const [isAddingToQuote, setLoading] = useState(false);
  const sdk = useB2BSDK();

  const addProductsToQuote = async ({ selectedOptions, productId, quantity }: ProductData) => {
    setLoading(true);

    try {
      await sdk?.utils?.quote?.addProducts([
        {
          productId: Number(productId),
          quantity,
          selectedOptions: selectedOptions.map(mapToB2BProductOptions),
        },
      ]);
    } catch (error) {
      console.error('Failed to add products to quote:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isQuotesEnabled,
    isAddingToQuote,
    addProductsToQuote,
  };
};

/**
 * Hook for adding products to shopping lists
 * Provides functionality to add products to B2B shopping lists with loading states
 */
export const useAddToShoppingList = () => {
  const isShoppingListEnabled = useB2BShoppingListEnabled();
  const [isAddingToShoppingList, setLoading] = useState(false);
  const sdk = useB2BSDK();

  const addProductToShoppingList = async ({ selectedOptions, productId, quantity }: ProductData) => {
    setLoading(true);

    try {
      await sdk?.utils?.shoppingList?.addProductFromPage({
        productId: Number(productId),
        quantity,
        selectedOptions: selectedOptions.map(mapToB2BProductOptions),
      });
    } catch (error) {
      console.error('Failed to add product to shopping list:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isShoppingListEnabled,
    isAddingToShoppingList,
    addProductToShoppingList,
  };
}; 