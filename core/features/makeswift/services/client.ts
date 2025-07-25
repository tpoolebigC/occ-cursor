import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';

import { defaultLocale } from '~/i18n/routing';

import { runtime } from '../utils/runtime';

/**
 * Makeswift Client Configuration
 * Initializes and configures the Makeswift visual editing client
 */

// Environment validation (server-side only)
if (typeof window === 'undefined') {
  strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');
}

// Initialize Makeswift client
export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY || '', {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
});

/**
 * Get page snapshot from Makeswift
 */
export const getPageSnapshot = async ({ path, locale }: { path: string; locale: string }) =>
  await client.getPageSnapshot(path, {
    siteVersion: await getSiteVersion(),
    locale: normalizeLocale(locale),
  });

/**
 * Get component snapshot from Makeswift
 */
export const getComponentSnapshot = async (snapshotId: string) => {
  const locale = await getLocale();

  return await client.getComponentSnapshot(snapshotId, {
    siteVersion: await getSiteVersion(),
    locale: normalizeLocale(locale),
  });
};

/**
 * Normalize locale for Makeswift API
 */
function normalizeLocale(locale: string): string | undefined {
  return locale === defaultLocale ? undefined : locale;
} 