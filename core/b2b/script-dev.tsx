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
          window.b3CheckoutConfig = {
            routes: {
              dashboard: '/custom-dashboard',
            },
          }
          window.B3 = {
            setting: {
              store_hash: '${storeHash}',
              channel_id: ${channelId},
              platform: 'catalyst',
              cart_url: '/cart',
              environment: 'local',
            },
            'dom.checkoutRegisterParentElement': '#checkout-app',
            'dom.registerElement': '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
            'dom.openB3Checkout': 'checkout-customer-continue',
            before_login_goto_page: '/custom-dashboard',
            checkout_super_clear_session: 'true',
            'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
          }
        `}
      </Script>
      <Script id="b2b-custom-redirect">
        {`
          // Override B2B login behavior to redirect to our custom dashboard
          document.addEventListener('DOMContentLoaded', function() {
            // Intercept B2B login links
            const b2bLoginLinks = document.querySelectorAll('[href*="/login.php"], [href*="/account.php"]');
            b2bLoginLinks.forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                // Redirect to our custom dashboard
                window.location.href = '/custom-dashboard';
              });
            });
            
            // Also override any B2B navigation
            if (window.B3 && window.B3.setting) {
              window.B3.setting.before_login_goto_page = '/custom-dashboard';
            }
          });
        `}
      </Script>
    </>
  );
} 