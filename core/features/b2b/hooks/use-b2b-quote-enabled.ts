'use client';

import { B2BRole } from '../types/customer';
import { useB2BSDK } from '~/shared/hooks/use-b2b-sdk';

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
 * Check if a specific configuration is enabled
 */
const isConfigEnabled = (configs: Config[], key: string): boolean => {
  return configs.find((c) => c.key === key)?.value === '1';
};

/**
 * B2B Quote Enabled Hook
 * Determines if quote functionality is enabled based on user role and configuration
 */
export const useB2BQuoteEnabled = (): boolean => {
  const sdk = useB2BSDK();

  const config = sdk?.utils?.quote?.getQuoteConfigs() as Config[] | undefined;
  const role = sdk?.utils?.user.getProfile().role;

  if (!config || role === undefined) {
    return false;
  }

  if (role === B2BRole.GUEST) {
    return isConfigEnabled(config, 'quote_for_guest');
  }

  if (role === B2BRole.B2C) {
    return isConfigEnabled(config, 'quote_for_individual_customer');
  }

  return isConfigEnabled(config, 'quote_for_b2b');
}; 