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
  assetsVersion?: string;
}

export function ScriptProduction({ cartId, storeHash, channelId, token, environment, assetsVersion }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  // Determine the script source based on whether we have a custom assets version
  const scriptSrc = assetsVersion 
    ? `https://store-${storeHash}.mybigcommerce.com/content/b2b-${assetsVersion}/index.js`
    : `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;

  return (
    <>
      <Script id="b2b-config">
        {`
            window.b3CheckoutConfig = {
              routes: {
                dashboard: '/custom-buyer-portal',
              },
            }
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
        data-assets-version={assetsVersion || 'default'}
        src={scriptSrc}
        type="module"
      />
    </>
  );
} 