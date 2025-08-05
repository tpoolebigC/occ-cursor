import { getCustomerInfo } from '~/b2b/server-actions';

export default async function TestPage() {
  try {
    console.log('🧪 [Test] Starting test page...');
    
    const customerResult = await getCustomerInfo();
    
    console.log('🧪 [Test] Customer result:', customerResult);
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Customer Info Test</h2>
          
          {customerResult.error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{customerResult.error}</p>
            </div>
          ) : customerResult.customer ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-800">Success</h3>
              <p className="text-green-700">
                Customer: {customerResult.customer.firstName} {customerResult.customer.lastName}
              </p>
              <p className="text-green-700">Email: {customerResult.customer.email}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-800">No Customer Data</h3>
              <p className="text-yellow-700">No customer information available</p>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Raw Response:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(customerResult, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mt-6">
          <a 
            href="/custom-dashboard"
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ [Test] Error in test page:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Test Page - Error</h1>
        
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">Error Occurred</h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
            {error instanceof Error ? error.stack : 'No stack trace available'}
          </pre>
        </div>
        
        <div className="mt-6">
          <a 
            href="/custom-dashboard"
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
} 