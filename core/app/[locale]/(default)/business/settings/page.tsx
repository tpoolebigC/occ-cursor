import { auth } from '~/auth';
import { B2BSettingsForm } from '~/components/b2b/b2b-settings-form';

export default async function B2BSettingsPage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your B2B account preferences and settings.
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
        </div>
        <div className="p-6">
          <B2BSettingsForm />
        </div>
      </div>
    </div>
  );
} 