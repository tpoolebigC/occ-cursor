import { auth } from '~/auth';
import { loginWithB2B } from '~/features/b2b/services/client';
import { getSessionCustomerAccessToken } from '~/auth';

export default async function B2BDebugPage() {
  const session = await auth();
  const customerAccessToken = await getSessionCustomerAccessToken();

  // Test B2B login if we have a customer access token
  let b2bTestResult = null;
  if (customerAccessToken && session?.user) {
    try {
      console.log('Testing B2B login...');
      const b2bToken = await loginWithB2B({
        customerId: parseInt(session.user.id || '0', 10),
        customerAccessToken: {
          value: customerAccessToken,
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        },
      });
      b2bTestResult = { success: true, token: b2bToken };
    } catch (error) {
      b2bTestResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">B2B Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Session Information</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
          <p><strong>Has User:</strong> {session?.user ? 'Yes' : 'No'}</p>
          <p><strong>Has B2B Token:</strong> {session?.b2bToken ? 'Yes' : 'No'}</p>
          <p><strong>B2B Token Length:</strong> {session?.b2bToken?.length || 0}</p>
          <p><strong>User Email:</strong> {session?.user?.email || 'N/A'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
          <p><strong>Cart ID:</strong> {session?.user?.cartId || 'N/A'}</p>
          <p><strong>Customer Access Token:</strong> {customerAccessToken ? 'Present' : 'Missing'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><strong>STORE_HASH:</strong> {process.env.BIGCOMMERCE_STORE_HASH || 'NOT SET'}</p>
          <p><strong>CHANNEL_ID:</strong> {process.env.BIGCOMMERCE_CHANNEL_ID || 'NOT SET'}</p>
          <p><strong>B2B_API_TOKEN:</strong> {process.env.B2B_API_TOKEN ? 'SET' : 'NOT SET'}</p>
          <p><strong>B2B_API_HOST:</strong> {process.env.B2B_API_HOST || 'NOT SET'}</p>
          <p><strong>STAGING_B2B_CDN_ORIGIN:</strong> {process.env.STAGING_B2B_CDN_ORIGIN || 'false'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">B2B API Test</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          {b2bTestResult ? (
            b2bTestResult.success ? (
              <div>
                <p className="text-green-600"><strong>✅ B2B API Test Successful!</strong></p>
                <p><strong>Token Preview:</strong> {b2bTestResult.token?.substring(0, 50)}...</p>
                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold">Full Token (click to expand)</summary>
                  <pre className="mt-2 text-xs overflow-auto">{b2bTestResult.token}</pre>
                </details>
              </div>
            ) : (
              <div>
                <p className="text-red-600"><strong>❌ B2B API Test Failed</strong></p>
                <p><strong>Error:</strong> {b2bTestResult.error}</p>
              </div>
            )
          ) : (
            <p className="text-yellow-600">No customer access token available for testing</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Links</h2>
        <div className="space-y-2">
          <a 
            href="/?section=orders" 
            className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Orders Section
          </a>
          <a 
            href="/?section=register" 
            className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Register Section
          </a>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">B2B Token Details</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          {session?.b2bToken ? (
            <div>
              <p><strong>Token Preview:</strong> {session.b2bToken.substring(0, 50)}...</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Full Token (click to expand)</summary>
                <pre className="mt-2 text-xs overflow-auto">{session.b2bToken}</pre>
              </details>
            </div>
          ) : (
            <p className="text-red-600">No B2B token found in session</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps</h2>
        <div className="bg-yellow-100 p-4 rounded text-sm">
          <ol className="list-decimal list-inside space-y-1">
            <li>Check if you're logged in as a B2B user</li>
            <li>Verify the B2B token is present in the session</li>
            <li>Open browser console and look for B2B-related errors</li>
            <li>Try clicking the test links above</li>
            <li>Check if the B2B script loads in the Network tab</li>
            <li>If B2B API test fails, the customer might not have B2B permissions</li>
          </ol>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Common Issues</h2>
        <div className="bg-red-100 p-4 rounded text-sm">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Customer not in B2B group:</strong> The customer must be assigned to a B2B customer group in BigCommerce admin</li>
            <li><strong>B2B features not enabled:</strong> B2B features must be enabled in your BigCommerce store</li>
            <li><strong>Invalid B2B API token:</strong> The B2B API token might be expired or invalid</li>
            <li><strong>Wrong channel ID:</strong> The channel ID must match your B2B configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 