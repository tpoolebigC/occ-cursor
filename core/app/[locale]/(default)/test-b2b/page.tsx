import { auth, signOut } from '~/auth';
import { getCartId } from '~/lib/cart';
import { CustomerDebug } from '~/components/b2b/customer-debug';

export default async function TestB2BPage() {
  const session = await auth();
  const cartId = await getCartId();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">B2B Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Session:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            hasSession: !!session,
            hasUser: !!session?.user,
            hasB2BToken: !!session?.b2bToken,
            hasCartId: !!session?.user?.cartId,
            user: session?.user ? {
              name: session.user.name,
              email: session.user.email,
              hasCartId: !!session.user.cartId
            } : null
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            hasB2BApiToken: !!process.env.B2B_API_TOKEN,
            hasB2BApiHost: !!process.env.B2B_API_HOST,
            b2bApiHost: process.env.B2B_API_HOST,
            storeHash: process.env.BIGCOMMERCE_STORE_HASH,
            channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
            stagingB2B: process.env.STAGING_B2B_CDN_ORIGIN
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Cart Info:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            cartId,
            hasCartId: !!cartId
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">B2B SDK Test:</h2>
        <p className="mb-2">Open your browser console and run these commands to test B2B functionality:</p>
        <div className="bg-white p-3 rounded text-sm font-mono">
          <div className="mb-2">
            <strong>Check B2B SDK:</strong><br/>
            <code>console.log('B2B SDK:', window.b2b)</code>
          </div>
          <div className="mb-2">
            <strong>Check B2B Token:</strong><br/>
            <code>console.log('B2B Token:', window.b2b?.utils?.user?.getB2BToken())</code>
          </div>
          <div className="mb-2">
            <strong>Check User Profile:</strong><br/>
            <code>console.log('User Profile:', window.b2b?.utils?.user?.getProfile())</code>
          </div>
          <div className="mb-2">
            <strong>Open B2B Orders Page:</strong><br/>
            <code>window.b2b?.utils?.openPage('ORDERS')</code>
          </div>
          <div className="mb-2">
            <strong>Open B2B Register Page:</strong><br/>
            <code>window.b2b?.utils?.openPage('REGISTER_ACCOUNT')</code>
          </div>
          <div className="mb-2">
            <strong>Check B2B Quote Configs:</strong><br/>
            <code>console.log('Quote Configs:', window.b2b?.utils?.quote?.getQuoteConfigs())</code>
          </div>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">B2B Navigation Test:</h2>
        <p className="mb-2">Try these URLs to access B2B features:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><a href="/?section=orders" className="text-blue-600 hover:underline">B2B Orders (Home Page)</a></li>
          <li><a href="/account/orders" className="text-blue-600 hover:underline">Regular Orders (will redirect to B2B)</a></li>
          <li><a href="/login" className="text-blue-600 hover:underline">Login (will redirect to B2B if logged in)</a></li>
        </ul>
        <p className="text-sm mt-2 text-gray-600">
          Note: B2B users are automatically redirected to the home page with B2B features enabled.
        </p>
      </div>

      <form action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }} className="mb-4">
        <button 
          type="submit" 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Force Logout
        </button>
      </form>

      <CustomerDebug />
    </div>
  );
} 