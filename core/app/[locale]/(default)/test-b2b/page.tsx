import { auth, signOut } from '~/auth';
import { getCartId } from '~/lib/cart';
import { CustomerDebug } from '~/components/b2b/customer-debug';

export default async function TestB2BPage() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">B2B Test Page</h1>
      <p className="mb-4 text-gray-600">
        This page is for testing B2B functionality. It will not be available in production.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">B2B SDK Tests</h2>
          <p className="text-sm mb-3">Open browser console and run these commands:</p>
          
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2 rounded">
              <code>console.log('B2B SDK:', window.b2b)</code>
            </div>
            <div className="bg-white p-2 rounded">
              <code>console.log('B2B Token:', window.b2b?.utils?.user?.getB2BToken())</code>
            </div>
            <div className="bg-white p-2 rounded">
              <code>console.log('User Profile:', window.b2b?.utils?.user?.getProfile())</code>
            </div>
            <div className="bg-white p-2 rounded">
              <code>console.log('Cart Info:', window.b2b?.utils?.cart?.getCart())</code>
            </div>
            <div className="bg-white p-2 rounded">
              <code>console.log('Quote Configs:', window.b2b?.utils?.quote?.getQuoteConfigs())</code>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">B2B Navigation Tests</h2>
          <p className="text-sm mb-3">Test B2B navigation functions:</p>
          
          <div className="space-y-2">
            <button 
              onClick={() => {
                if ((window as any).B3?.utils?.user?.openPage) {
                  (window as any).B3.utils.user.openPage('orders');
                }
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm block w-full"
            >
              Open Orders Page
            </button>
            <button 
              onClick={() => {
                if ((window as any).B3?.utils?.user?.openPage) {
                  (window as any).B3.utils.user.openPage('quotes');
                }
              }}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm block w-full"
            >
              Open Quotes Page
            </button>
            <button 
              onClick={() => {
                if ((window as any).B3?.utils?.user?.openPage) {
                  (window as any).B3.utils.user.openPage('account');
                }
              }}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm block w-full"
            >
              Open Account Page
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CustomerDebug />
      </div>
    </div>
  );
} 