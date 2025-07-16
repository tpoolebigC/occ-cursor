import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';
import { B2BQuotesList } from '~/components/b2b/b2b-quotes-list';
import { B2BCreateQuoteForm } from '~/components/b2b/b2b-create-quote-form';

export default async function B2BQuotesPage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  // Set the B2B token for API calls
  b2bClient.setCustomerToken(session.b2bToken);

  // Fetch quotes data
  const quotes = await b2bClient.getQuotes().catch(() => []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <p className="mt-2 text-gray-600">
          Manage your quotes and create new ones for your customers.
        </p>
      </div>

      {/* Create Quote Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Create New Quote</h2>
        </div>
        <div className="p-6">
          <B2BCreateQuoteForm />
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Quotes</h2>
        </div>
        <div className="p-6">
          <B2BQuotesList quotes={quotes} />
        </div>
      </div>
    </div>
  );
} 