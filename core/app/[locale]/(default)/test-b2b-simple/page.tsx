'use client';

import { useEffect, useState } from 'react';

export default function TestB2BSimplePage() {
  const [events, setEvents] = useState<string[]>([]);
  const [b2bStatus, setB2bStatus] = useState<string>('Checking...');
  const [cartId, setCartId] = useState<string>('none');
  const [b2bAuthStatus, setB2bAuthStatus] = useState<string>('Checking...');

  useEffect(() => {
    const addEvent = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setEvents(prev => [...prev, `${timestamp}: ${message}`]);
      console.log(`[${timestamp}] ${message}`);
    };

    // Check for B2B SDK
    const checkB2B = () => {
      const b2b = (window as any).b2b;
      if (b2b) {
        setB2bStatus('B2B SDK Found');
        addEvent('B2B SDK detected');
        
        // Check for cart functionality
        if (b2b.utils?.cart) {
          addEvent('B2B cart utils available');
          const currentCartId = b2b.utils.cart.getEntityId();
          setCartId(currentCartId || 'none');
          addEvent(`Current B2B cart ID: ${currentCartId || 'none'}`);
        } else {
          addEvent('B2B cart utils NOT available');
        }
        
        // Check for callbacks
        if (b2b.callbacks) {
          addEvent('B2B callbacks available');
        } else {
          addEvent('B2B callbacks NOT available');
        }

        // Check B2B authentication
        if (b2b.utils?.user) {
          addEvent('B2B user utils available');
          try {
            const b2bToken = b2b.utils.user.getB2BToken();
            const profile = b2b.utils.user.getProfile();
            addEvent(`B2B Token: ${b2bToken ? 'Available' : 'Not available'}`);
            addEvent(`B2B Profile: ${profile ? 'Available' : 'Not available'}`);
            
            if (b2bToken) {
              setB2bAuthStatus('Authenticated');
              addEvent('✅ B2B user is authenticated');
            } else {
              setB2bAuthStatus('Not Authenticated');
              addEvent('❌ B2B user is NOT authenticated');
            }
          } catch (error) {
            setB2bAuthStatus('Error checking auth');
            addEvent(`❌ Error checking B2B auth: ${error}`);
          }
        } else {
          setB2bAuthStatus('User utils not available');
          addEvent('B2B user utils NOT available');
        }
      } else {
        setB2bStatus('B2B SDK Not Found');
        addEvent('B2B SDK not detected');
      }
    };

    // Set up event listeners
    const setupListeners = () => {
      const b2b = (window as any).b2b;
      
      if (b2b?.callbacks?.addEventListener) {
        try {
          // Listen for cart created events
          b2b.callbacks.addEventListener('on-cart-created', (event: any) => {
            addEvent(`🎯 B2B Cart Created: ${JSON.stringify(event)}`);
            // Update cart ID immediately
            setTimeout(() => {
              const newCartId = b2b.utils?.cart?.getEntityId();
              setCartId(newCartId || 'none');
              addEvent(`🔄 Updated cart ID: ${newCartId || 'none'}`);
            }, 100);
          });

          // Listen for other B2B events
          b2b.callbacks.addEventListener('on-registered', (event: any) => {
            addEvent(`👤 B2B User Registered: ${JSON.stringify(event)}`);
            setB2bAuthStatus('Registered');
          });

          b2b.callbacks.addEventListener('on-logout', (event: any) => {
            addEvent(`🚪 B2B User Logout: ${JSON.stringify(event)}`);
            setB2bAuthStatus('Logged Out');
          });

          addEvent('B2B event listeners added successfully');
        } catch (error) {
          addEvent(`❌ Failed to add B2B listeners: ${error}`);
        }
      }

      // Also listen for general cart events
      window.addEventListener('cart-created', (event: any) => {
        addEvent(`🛒 General cart-created: ${JSON.stringify(event)}`);
      });
      
      window.addEventListener('cart-updated', (event: any) => {
        addEvent(`🔄 General cart-updated: ${JSON.stringify(event)}`);
      });

      // Listen for any custom events that might be fired
      window.addEventListener('b2b-cart-created', (event: any) => {
        addEvent(`🎯 Custom B2B cart-created: ${JSON.stringify(event)}`);
      });

      window.addEventListener('b2b-item-added', (event: any) => {
        addEvent(`➕ B2B item added: ${JSON.stringify(event)}`);
      });
    };

    // Initial check
    checkB2B();
    setupListeners();

    // Poll for B2B SDK and cart ID changes
    const interval = setInterval(() => {
      const b2b = (window as any).b2b;
      if (b2b && b2bStatus === 'B2B SDK Not Found') {
        checkB2B();
        setupListeners();
      }
      
      // Check for cart ID changes
      if (b2b?.utils?.cart) {
        const currentCartId = b2b.utils.cart.getEntityId();
        if (currentCartId !== cartId) {
          setCartId(currentCartId || 'none');
          addEvent(`🔄 Cart ID changed: ${cartId} → ${currentCartId || 'none'}`);
        }
      }

      // Check for auth status changes
      if (b2b?.utils?.user) {
        try {
          const b2bToken = b2b.utils.user.getB2BToken();
          const newAuthStatus = b2bToken ? 'Authenticated' : 'Not Authenticated';
          if (newAuthStatus !== b2bAuthStatus) {
            setB2bAuthStatus(newAuthStatus);
            addEvent(`🔐 Auth status changed: ${b2bAuthStatus} → ${newAuthStatus}`);
          }
        } catch (error) {
          // Ignore auth check errors during polling
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [b2bStatus, cartId, b2bAuthStatus]);

  const testAddToCart = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.cart) {
      const currentCartId = b2b.utils.cart.getEntityId();
      setEvents(prev => [...prev, `🧪 Testing cart - Current ID: ${currentCartId || 'none'}`]);
      
      // Try to manually trigger a cart creation event
      if (b2b.callbacks?.dispatchEvent) {
        try {
          b2b.callbacks.dispatchEvent('on-cart-created');
          setEvents(prev => [...prev, '✅ Manually triggered cart-created event']);
        } catch (error) {
          setEvents(prev => [...prev, `❌ Failed to trigger event: ${error}`]);
        }
      }
    } else {
      setEvents(prev => [...prev, '❌ B2B cart utils not available for testing']);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const checkCartId = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.cart) {
      const currentCartId = b2b.utils.cart.getEntityId();
      setEvents(prev => [...prev, `🔍 Current cart ID: ${currentCartId || 'none'}`]);
      setCartId(currentCartId || 'none');
    } else {
      setEvents(prev => [...prev, '❌ B2B cart utils not available']);
    }
  };

  const checkB2BAuth = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.user) {
      try {
        const b2bToken = b2b.utils.user.getB2BToken();
        const profile = b2b.utils.user.getProfile();
        setEvents(prev => [...prev, `🔐 B2B Token: ${b2bToken ? 'Available' : 'Not available'}`]);
        setEvents(prev => [...prev, `👤 B2B Profile: ${profile ? 'Available' : 'Not available'}`]);
        
        if (b2bToken) {
          setB2bAuthStatus('Authenticated');
          setEvents(prev => [...prev, '✅ B2B user is authenticated']);
        } else {
          setB2bAuthStatus('Not Authenticated');
          setEvents(prev => [...prev, '❌ B2B user is NOT authenticated']);
        }
      } catch (error) {
        setEvents(prev => [...prev, `❌ Error checking B2B auth: ${error}`]);
      }
    } else {
      setEvents(prev => [...prev, '❌ B2B user utils not available']);
    }
  };

  const testCartCreation = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.cart) {
      setEvents(prev => [...prev, '🧪 Testing cart creation...']);
      
      // Try to create a cart by setting a cart ID
      try {
        // This might trigger cart creation
        b2b.utils.cart.setEntityId('test-cart-id');
        setEvents(prev => [...prev, '✅ Set test cart ID']);
        
        // Check if cart ID changed
        setTimeout(() => {
          const newCartId = b2b.utils.cart.getEntityId();
          setEvents(prev => [...prev, `🔍 Cart ID after set: ${newCartId || 'none'}`]);
        }, 500);
      } catch (error) {
        setEvents(prev => [...prev, `❌ Error setting cart ID: ${error}`]);
      }
    } else {
      setEvents(prev => [...prev, '❌ B2B cart utils not available']);
    }
  };

  const testGlobalDebug = () => {
    const b2bDebug = (window as any).b2bDebug;
    if (b2bDebug) {
      setEvents(prev => [...prev, '🧪 Testing global B2B debug...']);
      
      try {
        const cartId = b2bDebug.getCartId();
        const b2bToken = b2bDebug.getB2BToken();
        const profile = b2bDebug.getProfile();
        
        setEvents(prev => [...prev, `🔍 Global Debug - Cart ID: ${cartId || 'none'}`]);
        setEvents(prev => [...prev, `🔍 Global Debug - B2B Token: ${b2bToken ? 'Available' : 'Not available'}`]);
        setEvents(prev => [...prev, `🔍 Global Debug - Profile: ${profile ? 'Available' : 'Not available'}`]);
        
        // Try to trigger cart created event
        b2bDebug.triggerCartCreated();
        setEvents(prev => [...prev, '✅ Triggered cart created via global debug']);
      } catch (error) {
        setEvents(prev => [...prev, `❌ Error with global debug: ${error}`]);
      }
    } else {
      setEvents(prev => [...prev, '❌ Global B2B debug not available']);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple B2B Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">B2B Status: {b2bStatus}</h2>
        <h3 className="text-md font-semibold mb-2">B2B Auth: {b2bAuthStatus}</h3>
        <h3 className="text-md font-semibold mb-2">Current Cart ID: {cartId}</h3>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Events ({events.length}):</h2>
        <div className="max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-600">No events yet...</p>
          ) : (
            <div className="space-y-1">
              {events.map((event, index) => (
                <div key={index} className="text-sm bg-white p-2 rounded">
                  {event}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Actions:</h2>
        <div className="space-x-2 mb-2">
          <button 
            onClick={testAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Cart
          </button>
          <button 
            onClick={checkCartId}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check Cart ID
          </button>
          <button 
            onClick={checkB2BAuth}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Check B2B Auth
          </button>
          <button 
            onClick={clearEvents}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Events
          </button>
        </div>
        <div className="space-x-2">
          <button 
            onClick={testCartCreation}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Test Cart Creation
          </button>
          <button 
            onClick={testGlobalDebug}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Global Debug
          </button>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Watch the events list for B2B SDK detection</li>
          <li>Check if B2B Auth shows "Authenticated"</li>
          <li>Try "Test Cart Creation" to see if we can force cart creation</li>
          <li>Try "Test Global Debug" to use the enhanced debugging</li>
          <li>Add a product from the B2B buyer portal</li>
          <li>Look for cart-created events in the list</li>
          <li>Check if the cart ID changes from "none" to a real ID</li>
          <li>Check browser console for additional logs</li>
        </ol>
      </div>

      <div className="bg-red-100 p-4 rounded mt-4">
        <h2 className="text-lg font-semibold mb-2">Expected Behavior:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>B2B Auth should show "Authenticated" if B2B token is available</li>
          <li>"Test Cart Creation" should attempt to create a cart</li>
          <li>"Test Global Debug" should show enhanced debugging info</li>
          <li>When you add a product from B2B portal, you should see a "B2B Cart Created" event</li>
          <li>The cart ID should change from "none" to a real cart ID</li>
          <li>If B2B Auth shows "Not Authenticated", that's likely the root cause</li>
        </ul>
      </div>
    </div>
  );
} 