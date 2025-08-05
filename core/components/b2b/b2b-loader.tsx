import { z } from 'zod';

import { auth } from '~/auth';

import { B2BScript } from './b2b-script';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  B2B_API_HOST: z.string().optional(),
  B2B_API_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BUYER_PORTAL_URL: z.string().optional(),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
});

export async function B2BLoader() {
  // Disabled to prevent double headers - we're building our own custom B2B dashboard
  return null;
} 