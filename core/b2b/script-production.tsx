'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
  cartId?: string | null;
  assetsBase?: string; // Optional override to load buyer-portal assets from a custom base (e.g., WebDAV/ngrok)
}

export function ScriptProduction({ cartId, storeHash, channelId, token, environment, assetsBase }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  // Prefer custom assets base when provided; fall back to the default CDN headless loader
  const scriptSrc = assetsBase
    ? `${assetsBase.replace(/\/$/, '')}/headless.js`
    : `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;

  return (
    <>
      <Script id="b2b-config">
        {`
            window.B3 = {
              setting: {
                store_hash: '${storeHash}',
                channel_id: ${channelId},
                platform: 'catalyst',
                cart_url: '/cart',
              }
            }
        `}
      </Script>
      <Script
        data-channelid={channelId}
        data-environment={environment}
        data-storehash={storeHash}
        src={scriptSrc}
        type="module"
      />
    </>
  );
} 