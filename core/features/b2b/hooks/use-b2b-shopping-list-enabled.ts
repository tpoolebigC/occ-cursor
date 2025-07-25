'use client';

import { B2BRole } from '../types/customer';
import { useB2BSDK } from './use-b2b-sdk';

interface Config {
  key: string;
  value: string;
  extraFields?: {
    guest?: boolean;
    b2c?: boolean;
    b2b?: boolean;
  };
}

/**
 * B2B Shopping List Enabled Hook
 * Determines if shopping list functionality is enabled based on user role and configuration
 */
export const useB2BShoppingListEnabled = (): boolean => {
  const sdk = useB2BSDK();

  const quoteConfigs = sdk?.utils?.quote?.getQuoteConfigs() as Config[] | undefined;
  const role = sdk?.utils?.user.getProfile().role;

  if (!quoteConfigs || role === undefined) {
    return false;
  }

  const shoppingListConfig = quoteConfigs.find(
    ({ key }) => key === 'shopping_list_on_product_page',
  );

  if (shoppingListConfig?.value !== '1') {
    return false;
  }

  if (role === B2BRole.GUEST) {
    return Boolean(shoppingListConfig.extraFields?.guest);
  }

  if (role === B2BRole.B2C) {
    return Boolean(shoppingListConfig.extraFields?.b2c);
  }

  return Boolean(shoppingListConfig.extraFields?.b2b);
}; 