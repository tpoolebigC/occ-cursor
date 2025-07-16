import { auth } from '~/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DTCLoginForm } from '~/components/auth/dtc-login-form';

export async function generateMetadata() {
  const t = await getTranslations('Login');

  return {
    title: 'Individual Customer Login',
  };
}

export default async function DTCLoginPage() {
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
    console.log('DTC login page - Session object:', {
      customerAccessToken: session.customerAccessToken ? 'present' : 'missing',
      isB2BCustomer: session.isB2BCustomer,
      email: session.user?.email,
      name: session.user?.name
    });
    
    if (session.isB2BCustomer) {
      console.log('DTC login page - Redirecting to /business (B2B customer)');
      redirect('/business');
    } else {
      console.log('DTC login page - Redirecting to /account/orders (DTC customer)');
      redirect('/account/orders');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Individual Customer Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your personal account to view orders and manage your profile.
          </p>
        </div>
        
        <DTCLoginForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 