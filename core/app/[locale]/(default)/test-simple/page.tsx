export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Basic Functionality Test</h2>
        
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold text-green-800">Success!</h3>
          <p className="text-green-700">
            If you can see this page, the basic Next.js app is working correctly.
          </p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p><strong>Store Hash:</strong> {process.env.BIGCOMMERCE_STORE_HASH || 'Not set'}</p>
            <p><strong>Channel ID:</strong> {process.env.BIGCOMMERCE_CHANNEL_ID || 'Not set'}</p>
            <p><strong>Storefront Token:</strong> {process.env.BIGCOMMERCE_STOREFRONT_TOKEN ? 'Set' : 'Not set'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <a 
          href="/"
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
} 