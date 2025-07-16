'use client';

import { useEffect, useState } from 'react';

export function B2BDebug() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [b2bData, setB2bData] = useState<any>(null);
  const [cartData, setCartData] = useState<any>(null);
  const [quickOrderData, setQuickOrderData] = useState<any>(null);

  useEffect(() => {
    console.log('B2B Debug: Checking B2B integration');
    
    // Check for B2B portal elements
    const b2bElements = document.querySelectorAll('[data-b2b]');
    console.log('B2B Portal Elements:', b2bElements);
    
    // Check for B3 global object
    console.log('B3 Global Object:', (window as any).B3);
    console.log('B3 Checkout Config:', (window as any).b3CheckoutConfig);
    
    // Check for B2B SDK
    const b2bSDK = (window as any).b2b;
    console.log('B2B SDK:', b2bSDK);
    
    if (b2bSDK) {
      setB2bData({
        sdk: !!b2bSDK,
        utils: !!b2bSDK.utils,
        cart: !!b2bSDK.utils?.cart,
        user: !!b2bSDK.utils?.user,
        quote: !!b2bSDK.utils?.quote,
        callbacks: !!b2bSDK.callbacks,
        cartId: b2bSDK.utils?.cart?.getEntityId?.(),
        userProfile: b2bSDK.utils?.user?.getProfile?.(),
        b2bToken: b2bSDK.utils?.user?.getB2BToken?.(),
        quoteConfigs: b2bSDK.utils?.quote?.getQuoteConfigs?.(),
      });
    }
    
    // Check for cart cookie
    const cartId = document.cookie
      .split('; ')
      .find(row => row.startsWith('cartId='))
      ?.split('=')[1];
    
    setCartData({
      cartId,
      cookies: document.cookie,
    });

    // Monitor for quick order events
    const handleQuickOrderEvent = (event: any) => {
      console.log('Quick Order Event:', event);
      setQuickOrderData(prev => ({
        ...prev,
        lastEvent: event,
        timestamp: new Date().toISOString()
      }));
    };

    // Listen for various B2B events
    if (b2bSDK?.callbacks) {
      b2bSDK.callbacks.addEventListener('on-cart-created', handleQuickOrderEvent);
      b2bSDK.callbacks.addEventListener('on-product-added', handleQuickOrderEvent);
      b2bSDK.callbacks.addEventListener('on-cart-updated', handleQuickOrderEvent);
    }

    // Monitor for quick order form submissions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.querySelector && element.querySelector('form')) {
                const forms = element.querySelectorAll('form');
                forms.forEach(form => {
                  if (form.action && form.action.includes('quick') || form.action.includes('order')) {
                    console.log('Quick Order Form Found:', form);
                    setQuickOrderData(prev => ({
                      ...prev,
                      forms: [...(prev?.forms || []), {
                        action: form.action,
                        method: form.method,
                        elements: Array.from(form.elements).map(el => ({
                          name: (el as HTMLInputElement).name,
                          type: (el as HTMLInputElement).type,
                          value: (el as HTMLInputElement).value
                        }))
                      }]
                    }));
                  }
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      if (b2bSDK?.callbacks) {
        b2bSDK.callbacks.removeEventListener('on-cart-created', handleQuickOrderEvent);
        b2bSDK.callbacks.removeEventListener('on-product-added', handleQuickOrderEvent);
        b2bSDK.callbacks.removeEventListener('on-cart-updated', handleQuickOrderEvent);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">B2B Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>B2B SDK:</strong> {b2bData?.sdk ? '✅ Loaded' : '❌ Not loaded'}
        </div>
        
        {b2bData?.sdk && (
          <>
            <div>
              <strong>Cart ID:</strong> {b2bData.cartId || 'Not set'}
            </div>
            <div>
              <strong>User Profile:</strong> {b2bData.userProfile ? '✅ Available' : '❌ Not available'}
            </div>
            <div>
              <strong>Quote Utils:</strong> {b2bData.quote ? '✅ Available' : '❌ Not available'}
            </div>
            <div>
              <strong>Quote Configs:</strong> {b2bData.quoteConfigs?.length || 0} configs
            </div>
          </>
        )}
        
        <div>
          <strong>Main Cart ID:</strong> {cartData?.cartId || 'Not set'}
        </div>
        
        {quickOrderData?.forms && (
          <div>
            <strong>Quick Order Forms:</strong> {quickOrderData.forms.length} found
          </div>
        )}
        
        {quickOrderData?.lastEvent && (
          <div>
            <strong>Last Event:</strong> {quickOrderData.lastEvent.type} at {quickOrderData.timestamp}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => {
          console.log('B2B Debug Data:', { b2bData, cartData, quickOrderData });
        }}
        className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
      >
        Log to Console
      </button>
    </div>
  );
} 