import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';
import { B2BShoppingListsList } from '~/components/b2b/b2b-shopping-lists-list';
import { B2BCreateShoppingListForm } from '~/components/b2b/b2b-create-shopping-list-form';

export default async function B2BShoppingListsPage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  // Set the B2B token for API calls
  b2bClient.setCustomerToken(session.b2bToken);

  // Fetch shopping lists data
  const shoppingLists = await b2bClient.getShoppingLists().catch(() => []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Lists</h1>
        <p className="mt-2 text-gray-600">
          Create and manage shopping lists for your frequently ordered items.
        </p>
      </div>

      {/* Create Shopping List Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Create New Shopping List</h2>
        </div>
        <div className="p-6">
          <B2BCreateShoppingListForm />
        </div>
      </div>

      {/* Shopping Lists */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Shopping Lists</h2>
        </div>
        <div className="p-6">
          <B2BShoppingListsList shoppingLists={shoppingLists} />
        </div>
      </div>
    </div>
  );
} 