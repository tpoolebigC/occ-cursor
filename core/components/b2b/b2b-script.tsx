'use client';

import { useEffect, useRef } from 'react';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment?: 'staging' | 'production';
  cartId?: string | null;
}

export function B2BScript({ 
  storeHash, 
  channelId, 
  token, 
  environment = 'production',
  cartId 
}: Props) {
  const scriptRef = useRef<HTMLScriptElement>(null);
  const configRef = useRef<HTMLScriptElement>(null);

  useB2BAuth(token);
  useB2BCart(cartId);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    // Only load scripts if they haven't been loaded yet
    if (scriptRef.current || configRef.current) {
      return;
    }

    // Check if we should use local buyer portal
    const localBuyerPortalHost = process.env.NEXT_PUBLIC_LOCAL_BUYER_PORTAL_HOST || process.env.LOCAL_BUYER_PORTAL_HOST;
    const isLocalDevelopment = !!localBuyerPortalHost;

    console.log('B2B Script Debug:', {
      storeHash,
      channelId,
      environment,
      hasToken: !!token,
      cartId,
      isLocalDevelopment,
      localBuyerPortalHost
    });

    // Create config script with enhanced configuration
    const configScript = document.createElement('script');
    configScript.id = 'b2b-config';
    
    if (isLocalDevelopment) {
      // Local development configuration
      configScript.innerHTML = `
        window.b3CheckoutConfig = {
          routes: {
            dashboard: '/account.php?action=order_status',
          },
        }
        window.B3 = {
          setting: {
            store_hash: '${storeHash}',
            channel_id: ${channelId},
            platform: 'catalyst',
          },
          'dom.checkoutRegisterParentElement': '#checkout-app',
          'dom.registerElement': '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
          'dom.openB3Checkout': 'checkout-customer-continue',
          before_login_goto_page: '/account.php?action=order_status',
          checkout_super_clear_session: 'true',
          'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
        }
        console.log('B2B Local Config loaded:', window.B3);
      `;
    } else {
      // Production configuration
      configScript.innerHTML = `
        window.B3 = {
          setting: {
            store_hash: '${storeHash}',
            channel_id: ${channelId},
            platform: 'catalyst',
            cart_url: '/cart',
            enable_cart_creation: true,
            enable_cart_sync: true,
            debug_mode: true
          }
        }
        console.log('B2B Config loaded:', window.B3);
        
        // Add global B2B debugging
        window.b2bDebug = {
          getCartId: () => window.b2b?.utils?.cart?.getEntityId?.(),
          getB2BToken: () => window.b2b?.utils?.user?.getB2BToken?.(),
          getProfile: () => window.b2b?.utils?.user?.getProfile?.(),
          triggerCartCreated: () => {
            if (window.b2b?.callbacks?.dispatchEvent) {
              window.b2b.callbacks.dispatchEvent('on-cart-created');
              console.log('Manually triggered cart-created event');
            }
          }
        };
      `;
    }
    
    document.head.appendChild(configScript);
    configRef.current = configScript;

    if (isLocalDevelopment) {
      // Load local development scripts
      const viteRefreshScript = document.createElement('script');
      viteRefreshScript.type = 'module';
      viteRefreshScript.innerHTML = `
        import RefreshRuntime from '${localBuyerPortalHost}/@react-refresh'
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      `;
      document.head.appendChild(viteRefreshScript);

      const viteClientScript = document.createElement('script');
      viteClientScript.type = 'module';
      viteClientScript.src = `${localBuyerPortalHost}/@vite/client`;
      document.head.appendChild(viteClientScript);

      const mainScript = document.createElement('script');
      mainScript.type = 'module';
      mainScript.src = `${localBuyerPortalHost}/src/main.ts`;
      mainScript.onload = () => console.log('Local B2B Portal loaded successfully');
      mainScript.onerror = (e) => console.error('Local B2B Portal failed to load:', e);
      document.head.appendChild(mainScript);
      scriptRef.current = mainScript;
    } else {
      // Create production B2B script
      const b2bScript = document.createElement('script');
      b2bScript.setAttribute('data-channelid', channelId);
      b2bScript.setAttribute('data-environment', environment);
      b2bScript.setAttribute('data-storehash', storeHash);
      b2bScript.src = `https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`;
      b2bScript.type = 'module';
      b2bScript.onload = () => {
        console.log('B2B Script loaded successfully');
        
        // Wait a bit for the SDK to initialize, then check cart creation
        setTimeout(() => {
          const b2b = (window as any).b2b;
          if (b2b?.utils?.cart) {
            console.log('B2B Cart utils available after load');
            const currentCartId = b2b.utils.cart.getEntityId();
            console.log('Initial B2B cart ID:', currentCartId);
            
            // If no cart ID, try to create one
            if (!currentCartId) {
              console.log('No cart ID found, attempting to initialize cart...');
              // The B2B portal should create a cart when needed
            }
          }
        }, 1000);
      };
      b2bScript.onerror = (e) => console.error('B2B Script failed to load:', e);
      document.head.appendChild(b2bScript);
      scriptRef.current = b2bScript;
    }

    return () => {
      // Cleanup on unmount
      if (configRef.current) {
        document.head.removeChild(configRef.current);
        configRef.current = null;
      }
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [storeHash, channelId, environment, token, cartId]);

  // Return null to avoid React rendering conflicts
  return null;
} 