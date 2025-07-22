'use client';

import { useEffect, useState } from 'react';

export default function TestB2BCartPage() {
  const [b2bInfo, setB2bInfo] = useState<any>({});
  const [cartEvents, setCartEvents] = useState<any[]>([]);

  useEffect(() => {
    // Check B2B SDK status
    const checkB2BStatus = () => {
      const b2b = (window as any).b2b;
      const info = {
        hasB2B: !!b2b,
        hasUtils: !!b2b?.utils,
        hasCart: !!b2b?.utils?.cart,
        hasCallbacks: !!b2b?.callbacks,
        cartId: b2b?.utils?.cart?.getEntityId?.(),
        sdkVersion: b2b?.version,
      };
      setB2bInfo(info);
      console.log('🔍 B2B Status:', info);
    };

    // Listen for cart events
    const handleCartEvent = (event: any) => {
      console.log('🎯 Cart Event Received:', event);
      setCartEvents(prev => [...prev, { 
        timestamp: new Date().toISOString(), 
        event: event.type || 'unknown',
        data: event.detail || event.data || event
      }]);
    };

    // Check initial status
    checkB2BStatus();

    // Set up polling to check B2B status
    const interval = setInterval(checkB2BStatus, 2000);

    // Listen for various cart-related events
    window.addEventListener('cart-created', handleCartEvent);
    window.addEventListener('cart-updated', handleCartEvent);
    window.addEventListener('cart-item-added', handleCartEvent);

    // Also try to listen to B2B events if available
    const b2b = (window as any).b2b;
    if (b2b?.callbacks?.addEventListener) {
      try {
        b2b.callbacks.addEventListener('on-cart-created', handleCartEvent);
        console.log('✅ B2B cart event listener added');
      } catch (error) {
        console.error('❌ Failed to add B2B cart event listener:', error);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('cart-created', handleCartEvent);
      window.removeEventListener('cart-updated', handleCartEvent);
      window.removeEventListener('cart-item-added', handleCartEvent);
      
      if (b2b?.callbacks?.removeEventListener) {
        try {
          b2b.callbacks.removeEventListener('on-cart-created', handleCartEvent);
        } catch (error) {
          console.error('❌ Failed to remove B2B cart event listener:', error);
        }
      }
    };
  }, []);

  const testB2BCart = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.cart) {
      console.log('🧪 Testing B2B cart functionality...');
      const currentCartId = b2b.utils.cart.getEntityId();
      console.log('Current B2B cart ID:', currentCartId);
      
      // Try to trigger a cart creation event manually
      if (b2b.callbacks?.dispatchEvent) {
        try {
          b2b.callbacks.dispatchEvent('on-cart-created');
          console.log('✅ Manually triggered cart-created event');
        } catch (error) {
          console.error('❌ Failed to trigger cart event:', error);
        }
      }
    } else {
      console.log('❌ B2B cart utils not available');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">B2B Cart Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">B2B SDK Status:</h2>
        <pre className="text-sm">
          {JSON.stringify(b2bInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Cart Events ({cartEvents.length}):</h2>
        {cartEvents.length === 0 ? (
          <p className="text-gray-600">No cart events received yet...</p>
        ) : (
          <div className="space-y-2">
            {cartEvents.map((event, index) => (
              <div key={index} className="bg-white p-2 rounded text-sm">
                <div className="font-semibold">{event.timestamp}</div>
                <div className="text-gray-600">Event: {event.event}</div>
                <pre className="text-xs mt-1">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Testing:</h2>
        <button 
          onClick={testB2BCart}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test B2B Cart
        </button>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open browser console to see detailed logs</li>
          <li>Add a product from the B2B buyer portal</li>
          <li>Watch for cart events in the list above</li>
          <li>Check B2B SDK status for any issues</li>
          <li>Use the test button to manually trigger events</li>
        </ol>
      </div>
    </div>
  );
} 