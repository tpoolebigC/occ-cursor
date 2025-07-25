/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { serverClient as client } from '~/client/server-client';
import { defaultLocale } from '~/i18n/locales';

export const GET = async () => {
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale(defaultLocale));

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
