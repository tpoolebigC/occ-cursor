import { B2BNavigation } from '~/b2b/components/B2BNavigation';
import { UserManagementDashboard } from '~/b2b/components/UserManagementDashboard';
import { getCompanyInfo } from '~/b2b/server-actions';

export default async function UsersPage() {
  let companyId: string | undefined;
  let error: string | null = null;

  try {
    const result = await getCompanyInfo();
    if (result.error || !result.company?.id) {
      error = result.error ?? 'Could not resolve your company. Please ensure you are logged in as a B2B user.';
    } else {
      companyId = String(result.company.id);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load company context';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <B2BNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <UserManagementDashboard companyId={companyId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
