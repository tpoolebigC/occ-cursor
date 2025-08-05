import { CustomB2BDashboard } from '~/b2b/components/CustomB2BDashboard';
import { B2BScript } from '~/components/b2b/b2b-script';

export default async function CustomDashboardPage() {
  // Temporarily removed auth checks for debugging
  // const session = await auth();
  // if (!session?.user) {
  //   redirect('/login');
  // }
  // if (!session?.b2bToken) {
  //   redirect('/');
  // }

  const storeHash = process.env.BIGCOMMERCE_STORE_HASH || '';
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID || '1';

  console.log('CustomDashboardPage Environment Variables:', {
    storeHash,
    channelId,
    hasStoreHash: !!storeHash,
    hasChannelId: !!channelId
  });

  // Add error boundary
  try {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* Load B2B Script */}
        <B2BScript 
          storeHash={storeHash}
          channelId={channelId}
          environment="production"
        />
        
        <main className="flex-1">
          <CustomB2BDashboard />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error in CustomDashboardPage:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <pre className="text-sm text-gray-500 bg-gray-100 p-4 rounded overflow-auto max-w-2xl">
            {error instanceof Error ? error.stack : 'No stack trace available'}
          </pre>
        </div>
      </div>
    );
  }
} 