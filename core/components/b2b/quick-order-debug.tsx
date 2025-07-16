'use client';

import { useEffect, useState } from 'react';

export function QuickOrderDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkQuickOrder = () => {
      const info: any = {};

      // Check for B2B SDK
      const b2b = (window as any).b2b;
      info.b2bSDK = !!b2b;
      
      if (b2b) {
        info.utils = !!b2b.utils;
        info.quote = !!b2b.utils?.quote;
        info.cart = !!b2b.utils?.cart;
        info.callbacks = !!b2b.callbacks;
        
        // Check quote methods
        if (b2b.utils?.quote) {
          info.addProducts = typeof b2b.utils.quote.addProducts;
          info.getQuoteConfigs = typeof b2b.utils.quote.getQuoteConfigs;
        }
        
        // Check cart methods
        if (b2b.utils?.cart) {
          info.cartId = b2b.utils.cart.getEntityId?.();
        }
      }

      // Check for quick order forms
      const forms = document.querySelectorAll('form');
      const quickOrderForms = Array.from(forms).filter(form => {
        const action = form.action || '';
        const className = form.className || '';
        const id = form.id || '';
        return action.includes('quick') || 
               action.includes('order') || 
               className.includes('quick') || 
               className.includes('order') ||
               id.includes('quick') ||
               id.includes('order');
      });
      
      info.quickOrderForms = quickOrderForms.length;
      info.allForms = forms.length;

      // Check for search inputs
      const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
      info.searchInputs = searchInputs.length;

      // Check for add to cart buttons
      const addToCartButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
      info.addToCartButtons = addToCartButtons.length;

      // Check current URL
      info.currentUrl = window.location.href;
      info.isPurchasedProducts = window.location.href.includes('purchased-products');

      // Check for any errors in console
      const originalError = console.error;
      const errors: string[] = [];
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };

      setTimeout(() => {
        info.errors = errors;
        console.error = originalError;
        setDebugInfo(info);
      }, 1000);
    };

    // Check immediately
    checkQuickOrder();

    // Check periodically
    const interval = setInterval(checkQuickOrder, 2000);

    return () => clearInterval(interval);
  }, []);

  const testQuickOrder = () => {
    const b2b = (window as any).b2b;
    if (b2b?.utils?.quote?.addProducts) {
      console.log('Testing quick order addProducts...');
      try {
        b2b.utils.quote.addProducts([{
          productId: 1,
          quantity: 1
        }]);
        console.log('Quick order test completed');
      } catch (error) {
        console.error('Quick order test failed:', error);
      }
    } else {
      console.log('Quick order addProducts method not available');
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Quick Order Debug</h3>
      
      <div className="space-y-1 text-xs">
        <div><strong>B2B SDK:</strong> {debugInfo.b2bSDK ? '✅' : '❌'}</div>
        <div><strong>Quote Utils:</strong> {debugInfo.quote ? '✅' : '❌'}</div>
        <div><strong>Cart Utils:</strong> {debugInfo.cart ? '✅' : '❌'}</div>
        <div><strong>Cart ID:</strong> {debugInfo.cartId || 'Not set'}</div>
        <div><strong>Quick Order Forms:</strong> {debugInfo.quickOrderForms || 0}</div>
        <div><strong>Search Inputs:</strong> {debugInfo.searchInputs || 0}</div>
        <div><strong>Add to Cart Buttons:</strong> {debugInfo.addToCartButtons || 0}</div>
        <div><strong>On Purchased Products:</strong> {debugInfo.isPurchasedProducts ? '✅' : '❌'}</div>
      </div>

      <div className="mt-2 space-y-1">
        <button 
          onClick={testQuickOrder}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Quick Order
        </button>
        
        <button 
          onClick={() => {
            console.log('Quick Order Debug Info:', debugInfo);
          }}
          className="w-full text-xs bg-gray-500 text-white px-2 py-1 rounded"
        >
          Log to Console
        </button>
      </div>

      {debugInfo.errors && debugInfo.errors.length > 0 && (
        <div className="mt-2">
          <strong className="text-xs text-red-600">Recent Errors:</strong>
          <div className="text-xs text-red-600 max-h-20 overflow-y-auto">
            {debugInfo.errors.slice(-3).map((error: string, i: number) => (
              <div key={i} className="truncate">{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 