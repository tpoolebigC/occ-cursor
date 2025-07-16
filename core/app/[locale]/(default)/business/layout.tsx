import { auth } from '~/auth';
import { redirect } from 'next/navigation';

export default async function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // For now, let's allow all routes through and handle auth in individual pages
  // This prevents the circular redirect issue
  if (!session?.user) {
    // Don't redirect from the layout - let individual pages handle auth
    return <>{children}</>;
  }

  // If user is not a B2B customer, redirect to regular account
  if (!session.b2bToken) {
    redirect('/account');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">B2B Portal</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {session.user.name}
            </p>
          </div>
          {/* Temporarily removed B2BNavigation to test routing */}
          <nav className="mt-6 px-3">
            <ul className="space-y-1">
              <li>
                <a href="/business" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/business/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  Login
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 