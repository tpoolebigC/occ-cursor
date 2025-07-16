import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';
import { B2BProfileForm } from '~/components/b2b/b2b-profile-form';

export default async function B2BProfilePage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  // Set the B2B token for API calls
  b2bClient.setCustomerToken(session.b2bToken);

  // Fetch profile data
  const profile = await b2bClient.getProfile().catch(() => null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your B2B account information and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
        </div>
        <div className="p-6">
          <B2BProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
} 