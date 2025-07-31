import { redirect } from 'next/navigation';
import { auth } from '~/auth';
import { CustomB2BDashboard } from '~/b2b/components/CustomB2BDashboard';

export default async function CustomDashboardPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is B2B (you might need to adjust this based on your auth setup)
  if (!session?.b2bToken) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomB2BDashboard />
    </div>
  );
} 