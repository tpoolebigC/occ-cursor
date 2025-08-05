export default function TestNavigationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Navigation Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Links</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Links</h3>
              <div className="space-y-2">
                <a 
                  href="/custom-dashboard" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Dashboard (/custom-dashboard)
                </a>
                <a 
                  href="/custom-dashboard/orders" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Orders (/custom-dashboard/orders)
                </a>
                <a 
                  href="/custom-dashboard/quotes" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Quotes (/custom-dashboard/quotes)
                </a>
                <a 
                  href="/custom-dashboard/invoices" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Invoices (/custom-dashboard/invoices)
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">With Locale</h3>
              <div className="space-y-2">
                <a 
                  href="/en/custom-dashboard" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Dashboard (/en/custom-dashboard)
                </a>
                <a 
                  href="/en/custom-dashboard/orders" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Orders (/en/custom-dashboard/orders)
                </a>
                <a 
                  href="/en/custom-dashboard/quotes" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Quotes (/en/custom-dashboard/quotes)
                </a>
                <a 
                  href="/en/custom-dashboard/invoices" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Invoices (/en/custom-dashboard/invoices)
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Page Info</h3>
            <p className="text-sm text-gray-600">
              <strong>Path:</strong> /custom-dashboard/test-navigation
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> ✅ This page is accessible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 