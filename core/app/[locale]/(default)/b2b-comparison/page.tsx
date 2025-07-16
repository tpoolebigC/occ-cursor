import { auth } from '~/auth';
import Link from 'next/link';

export default async function B2BComparisonPage() {
  const session = await auth();

  // Check if user is logged in
  if (!session?.customerAccessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">B2B Portal Comparison</h1>
          <p className="text-gray-600 mb-4">Please log in to access B2B features.</p>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if B2B token is available
  const hasB2BToken = !!session?.b2bToken;

  // Welcome message for logged-in users
  const welcomeMessage = (
    <div className={`border-l-4 p-6 mb-8 ${hasB2BToken ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400'}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {hasB2BToken ? (
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h2 className={`text-lg font-semibold ${hasB2BToken ? 'text-blue-900' : 'text-yellow-900'}`}>
            Welcome back, {session.user?.name || 'B2B User'}!
          </h2>
          <p className={hasB2BToken ? 'text-blue-700' : 'text-yellow-700'}>
            {hasB2BToken 
              ? 'Choose your preferred B2B portal experience below. You can switch between them at any time.'
              : 'B2B authentication is not configured. Both portals require B2B API access. Contact your administrator to set up B2B integration.'
            }
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {welcomeMessage}
        
        {/* Quick Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Store
            </Link>
            {hasB2BToken ? (
              <Link
                href="/business"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Go to Custom Portal
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                title="B2B authentication required"
              >
                Custom Portal (Unavailable)
              </button>
            )}
            {hasB2BToken ? (
              <a
                href="/#/orders"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Hosted Portal
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                title="B2B authentication required"
              >
                Hosted Portal (Unavailable)
              </button>
            )}
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            B2B Portal Comparison
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare the out-of-the-box hosted B2B portal with our custom-built solution
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Hosted B2B Portal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Hosted B2B Portal</h2>
              <p className="text-blue-100 text-sm">BundleB2B - Out of the Box</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Basic quote management
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Order history
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Shopping lists
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Quick order functionality
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2">○</span>
                      Limited customization
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2">○</span>
                      Separate cart system
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pros</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Quick to implement</li>
                    <li>• No maintenance required</li>
                    <li>• Standard B2B features</li>
                    <li>• Official BigCommerce support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Cons</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Limited customization</li>
                    <li>• Separate user experience</li>
                    <li>• Cart synchronization issues</li>
                    <li>• No integration with main site</li>
                  </ul>
                </div>

                <div className="pt-4">
                  {hasB2BToken ? (
                    <a
                      href="/#/orders"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Hosted Portal
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-block w-full bg-gray-400 text-white text-center py-3 px-4 rounded-lg cursor-not-allowed"
                      title="B2B authentication required"
                    >
                      Hosted Portal Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Custom B2B Portal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Custom B2B Portal</h2>
              <p className="text-green-100 text-sm">Built with Catalyst & Algolia</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced quote management
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Integrated order system
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Smart shopping lists
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Algolia-powered search
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Seamless cart integration
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Full customization control
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pros</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Complete customization</li>
                    <li>• Integrated user experience</li>
                    <li>• Advanced search capabilities</li>
                    <li>• Seamless cart integration</li>
                    <li>• Brand consistency</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Cons</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Development time required</li>
                    <li>• Ongoing maintenance</li>
                    <li>• Custom feature development</li>
                  </ul>
                </div>

                <div className="pt-4">
                  {hasB2BToken ? (
                    <Link
                      href="/business"
                      className="inline-block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Try Custom Portal
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-block w-full bg-gray-400 text-white text-center py-3 px-4 rounded-lg cursor-not-allowed"
                      title="B2B authentication required"
                    >
                      Custom Portal Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hosted Portal
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custom Portal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Product Search
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Basic search
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Algolia-powered search
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Cart Integration
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Separate cart system
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Seamless integration
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    User Experience
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Generic interface
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Branded & customized
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Customization
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Limited options
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Full control
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Implementation Time
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Minutes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Days/Weeks
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Maintenance
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Handled by BigCommerce
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Custom maintenance
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Choose?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Both solutions have their merits. The hosted portal is perfect for quick implementation, 
            while the custom portal offers complete control and integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#/orders"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Hosted Portal
            </a>
            <Link
              href="/business"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Custom Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 