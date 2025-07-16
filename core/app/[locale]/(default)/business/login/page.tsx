import { auth } from '~/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { B2BLoginForm } from '~/components/b2b/b2b-login-form';

export async function generateMetadata() {
  const t = await getTranslations('Login');

  return {
    title: 'B2B Portal Login',
  };
}

export default async function B2BLoginPage() {
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
    console.log('Business login page - Session object:', {
      customerAccessToken: session.customerAccessToken ? 'present' : 'missing',
      isB2BCustomer: session.isB2BCustomer,
      email: session.user?.email,
      name: session.user?.name
    });
    
    if (session.isB2BCustomer) {
      console.log('Business login page - Redirecting to /business (B2B customer)');
      redirect('/business');
    } else {
      console.log('Business login page - Redirecting to /account/orders (DTC customer)');
      redirect('/account/orders');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            B2B Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your business account and manage quotes, orders, and shopping lists.
          </p>
        </div>
        
        <B2BLoginForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have a B2B account?{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contact us to get started
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 