'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import QuickOrderTable from '~/b2b/components/QuickOrderTable';
import QuickOrderPad from '~/b2b/components/QuickOrderPad';
// QuickAdd component removed - using QuickOrderPad instead
import { searchAlgoliaProducts } from '~/b2b/server-actions';
import { addToCart } from '~/b2b/services/cartService';
import { getCart } from '~/b2b/server-actions';
import type { Cart } from '~/b2b/services/cartService';

interface QuickOrderProduct {
  objectID: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  productId: number;
  description?: string;
}

interface QuickAddItem {
  sku: string;
  quantity: number;
  options?: string;
}

export default function QuickOrderPage() {
  const router = useRouter();
  const [activeMethod, setActiveMethod] = useState<'table' | 'pad' | 'bulk'>('table');
  const [cart, setCart] = useState<Cart | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Load current cart on component mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setIsLoadingCart(true);
    try {
      const result = await getCart();
      if (result.cart) {
        setCart(result.cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const addProductToCart = async (product: QuickOrderProduct, quantity: number = 1) => {
    try {
      const result = await addToCart([{
        productEntityId: product.productId,
        quantity: quantity
      }]);

      if (result.success) {
        // Reload cart to get updated state
        await loadCart();
        console.log('✅ Successfully added to cart:', product.name);
      } else {
        console.error('❌ Failed to add to cart:', result.errors);
        alert(`Failed to add ${product.name} to cart: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Error adding ${product.name} to cart`);
    }
  };

  const addProductBySku = async (sku: string, quantity: number) => {
    try {
      // Search for the product by SKU
      const results = await searchAlgoliaProducts(sku);
      const product = results.find(p => p.sku.toLowerCase() === sku.toLowerCase());
      
      if (product) {
        await addProductToCart(product, quantity);
        return { success: true, product };
      } else {
        throw new Error(`Product with SKU "${sku}" not found`);
      }
    } catch (error) {
      console.error('Error adding product by SKU:', error);
      throw error;
    }
  };

  const addBulkProducts = async (items: QuickAddItem[]) => {
    const results = [];
    
    for (const item of items) {
      try {
        const result = await addProductBySku(item.sku, item.quantity);
        results.push({ ...result, sku: item.sku });
      } catch (error) {
        results.push({ success: false, sku: item.sku, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    // Show results summary
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    if (errorCount > 0) {
      alert(`Added ${successCount} products successfully. ${errorCount} products failed to add.`);
    } else {
      alert(`Successfully added ${successCount} products to cart!`);
    }
    
    // Reload cart to show updated state
    await loadCart();
    
    return results;
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    const allItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
    return allItems.reduce((total, item) => {
      const price = (item.prices as any)?.price?.value || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    // Navigate to the main checkout page
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <B2BNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quick Order</h1>
              <p className="text-gray-600">Add multiple products to quotes, shopping lists, and orders</p>
            </div>
            <a
              href="/custom-dashboard"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Addition Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Method Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add Products</h2>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveMethod('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeMethod === 'table'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Product Table
                </button>
                <button
                  onClick={() => setActiveMethod('pad')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeMethod === 'pad'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Quick Add Pad
                </button>
                <button
                  onClick={() => setActiveMethod('bulk')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeMethod === 'bulk'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bulk Add
                </button>
              </div>

              {/* Product Table Method */}
              {activeMethod === 'table' && (
                <QuickOrderTable 
                  onAddToCart={addProductToCart}
                  showPreviouslyOrdered={true}
                />
              )}

              {/* Quick Add Pad Method */}
              {activeMethod === 'pad' && (
                <QuickOrderPad 
                  onAddBySku={addProductBySku}
                />
              )}

              {/* Bulk Add Method */}
              {activeMethod === 'bulk' && (
                <QuickOrderPad 
                  onAddBySku={addProductBySku}
                />
              )}
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shopping Cart</h2>
              
              {isLoadingCart ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading cart...</p>
                </div>
              ) : !cart || (cart.lineItems.physicalItems.length === 0 && cart.lineItems.digitalItems.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add products using the methods above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].map((item) => (
                    <div key={item.entityId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Product ID: {item.productEntityId}</p>
                        <p className="text-sm text-gray-900">{formatPrice((item.prices as any)?.price?.value || 0)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-900">{formatPrice(((item.prices as any)?.price?.value || 0) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cart && (cart.lineItems.physicalItems.length > 0 || cart.lineItems.digitalItems.length > 0) && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm text-gray-900">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 