import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  LOCAL_BUYER_PORTAL_HOST: z.string().url().optional(),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
});

export async function B2BLoader() {
  // Since we're building our own custom B2B dashboard,
  // we don't need to load the embedded buyer portal scripts
  return null;
} 