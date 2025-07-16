import { B2BDebug } from '~/components/b2b/b2b-debug';
import { CustomerDebug } from '~/components/b2b/customer-debug';

export default function B2BDebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">B2B Debug Page</h1>
      <p className="mb-4">This page helps debug B2B integration issues.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Customer Debug</h2>
          <CustomerDebug />
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">B2B Integration Debug</h2>
          <B2BDebug />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>B2B API Host:</strong> {process.env.B2B_API_HOST || 'Not set'}</li>
          <li><strong>B2B API Token:</strong> {process.env.B2B_API_TOKEN ? 'Set' : 'Not set'}</li>
          <li><strong>Store Hash:</strong> {process.env.BIGCOMMERCE_STORE_HASH || 'Not set'}</li>
          <li><strong>Channel ID:</strong> {process.env.BIGCOMMERCE_CHANNEL_ID || 'Not set'}</li>
        </ul>
      </div>
    </div>
  );
} 