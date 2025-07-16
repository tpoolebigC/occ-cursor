'use client';

import { useEffect, useState } from 'react';

export function CustomerDebug() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [customerData, setCustomerData] = useState<any>(null);
  const [b2bData, setB2bData] = useState<any>(null);
  const [cartData, setCartData] = useState<any>(null);

  useEffect(() => {
    console.log('Customer Debug: On account page');
    
    // Check for B2B portal elements
    const b2bElements = document.querySelectorAll('[data-b2b]');
    console.log('B2B Portal Elements:', b2bElements);
    
    // Check for B3 global object
    console.log('B3 Global Object:', (window as any).B3);
    console.log('B3 Checkout Config:', (window as any).b3CheckoutConfig);
    
    // Check for buyer portal scripts
    const scripts = document.querySelectorAll('script[src*="buyer-portal"]');
    console.log('Buyer Portal Scripts:', scripts);
    
    // Check for B2B SDK
    const b2bSDK = (window as any).b2b;
    console.log('B2B SDK:', b2bSDK);
    
    if (b2bSDK) {
      setB2bData({
        sdk: !!b2bSDK,
        utils: !!b2bSDK.utils,
        cart: !!b2bSDK.utils?.cart,
        user: !!b2bSDK.utils?.user,
        callbacks: !!b2bSDK.callbacks,
        cartId: b2bSDK.utils?.cart?.getEntityId?.(),
        userProfile: b2bSDK.utils?.user?.getProfile?.(),
        b2bToken: b2bSDK.utils?.user?.getB2BToken?.(),
      });
    }
    
    // Check for cart cookie
    const cartId = document.cookie
      .split('; ')
      .find(row => row.startsWith('cartId='))
      ?.split('=')[1];
    
    setCartData({
      cartId,
      cookieExists: !!cartId,
    });
    
    // Check for customer session
    const checkCustomerSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        setCustomerData({
          hasSession: !!session,
          user: session?.user,
          hasB2BToken: !!session?.b2bToken,
          hasCartId: !!session?.user?.cartId,
        });
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkCustomerSession();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">B2B Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>B2B SDK:</strong>
          <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto max-h-20">
            {JSON.stringify(b2bData, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Cart Data:</strong>
          <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto max-h-20">
            {JSON.stringify(cartData, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Customer Session:</strong>
          <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto max-h-20">
            {JSON.stringify(customerData, null, 2)}
          </pre>
        </div>
        
        <div className="pt-2 border-t">
          <button
            onClick={() => {
              console.log('Manual B2B SDK Check');
              const b2b = (window as any).b2b;
              console.log('B2B SDK:', b2b);
              if (b2b?.utils?.cart) {
                console.log('Current Cart ID:', b2b.utils.cart.getEntityId());
              }
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Test B2B SDK
          </button>
          
          <button
            onClick={() => {
              console.log('Manual Cart Cookie Check');
              const cartId = document.cookie
                .split('; ')
                .find(row => row.startsWith('cartId='))
                ?.split('=')[1];
              console.log('Cart ID from cookie:', cartId);
            }}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs ml-2"
          >
            Test Cart Cookie
          </button>
        </div>
      </div>
    </div>
  );
} 