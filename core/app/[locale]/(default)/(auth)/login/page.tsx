import { auth } from '~/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata() {
  const t = await getTranslations('Login');

  return {
    title: t('title'),
  };
}

export default async function Login() {
  const t = await getTranslations('Login');
  
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Failed to fetch session:', error);
    // Continue without session - user will need to log in
    session = null;
  }

  // If user is already logged in, redirect based on their type
  if (session && session.customerAccessToken) {
    console.log('Main login page - Session object:', {
      customerAccessToken: session.customerAccessToken ? 'present' : 'missing',
      isB2BCustomer: session.isB2BCustomer,
      email: session.user?.email,
      name: session.user?.name
    });
    
    if (session.isB2BCustomer) {
      console.log('Main login page - Redirecting to /business (B2B customer)');
      redirect('/business');
    } else {
      console.log('Main login page - Redirecting to /account/orders (DTC customer)');
      redirect('/account/orders');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Login Type
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select the appropriate login option for your account type
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login/dtc"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Individual Customer Login
          </Link>
          
          <Link
            href="/business/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-green-500 group-hover:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </span>
            Business Customer Login
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
