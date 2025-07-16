import { auth } from '~/auth';
import { getCartId } from '~/lib/cart';
import { CustomerDebug } from '~/b2b/customer-debug';

export default async function B2BDebugPage() {
  const session = await auth();
  const cartId = await getCartId();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">B2B Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Session Info:</h2>
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
        <h2 className="text-lg font-semibold mb-2">Cart Info:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            cartId,
            hasCartId: !!cartId
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Environment Info:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            hasB2BApiToken: !!process.env.B2B_API_TOKEN,
            hasB2BApiHost: !!process.env.B2B_API_HOST,
            storeHash: process.env.BIGCOMMERCE_STORE_HASH,
            channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
            stagingB2B: process.env.STAGING_B2B_CDN_ORIGIN
          }, null, 2)}
        </pre>
      </div>

      <CustomerDebug />
    </div>
  );
} 