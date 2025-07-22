import { auth } from '~/auth';
import { getCartId } from '~/lib/cart';
import { getBackupCartItems } from '~/lib/cart/backup-cart';

export default async function TestCartMergePage() {
  const session = await auth();
  const cartId = await getCartId();
  const backupCart = await getBackupCartItems();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Merge Test Page</h1>
      
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
        <h2 className="text-lg font-semibold mb-2">Cart Info:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            cartId,
            hasCartId: !!cartId
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Cart Backup:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            hasBackup: !!backupCart,
            backupData: backupCart ? {
              cartId: backupCart.cartId,
              itemCount: backupCart.items.length,
              timestamp: backupCart.timestamp
            } : null
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Add some items to your cart from the main storefront</li>
          <li>Open the browser console to see merge logs</li>
          <li>Add a product from the B2B buyer portal</li>
          <li>Check that your original cart items are preserved</li>
          <li>Verify the cart merge logs in the console</li>
        </ol>
      </div>

      <div className="bg-yellow-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Expected Behavior:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>When B2B creates a new cart, existing items should be merged</li>
          <li>No cart items should be lost during the process</li>
          <li>Console should show merge progress logs</li>
          <li>Backup should be created and cleared after successful merge</li>
        </ul>
      </div>
    </div>
  );
} 