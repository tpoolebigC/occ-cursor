import Link from 'next/link';

export function B2BLoginPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            B2B Portal Access Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You need to be logged in to access the B2B portal. Please sign in with your business account.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/business/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in to B2B Portal
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have a B2B account?{' '}
              <a href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                Contact us to get started
              </a>
            </p>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Regular customer?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 