'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  hostname: string;
  cartId?: string | null;
}

export function ScriptDev({ cartId, storeHash, channelId, token, hostname }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  return (
    <>
      {/* Vite React Refresh and Vite Client for local dev */}
      <Script type="module" id="b2b-vite-refresh">
        {`
          import RefreshRuntime from '${hostname}/@react-refresh';
          RefreshRuntime.injectIntoGlobalHook(window);
          window.$RefreshReg$ = () => {};
          window.$RefreshSig$ = () => (type) => type;
          window.__vite_plugin_react_preamble_installed__ = true;
        `}
      </Script>
      <Script type="module" src={`${hostname}/@vite/client`} />
      {/* Main B2B Portal Script */}
      <Script type="module" src={`${hostname}/src/main.ts`} />
      <Script id="b2b-config-dev">
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
    </>
  );
} 