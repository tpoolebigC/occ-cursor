'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { loginWithB2B } from '~/features/b2b/services/client';

export function B2BLoginTrigger() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleB2BLogin = async () => {
    if (!session?.user?.customerAccessToken || !session?.user?.entityId) {
      setError('No customer access token or entity ID available');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const b2bToken = await loginWithB2B({
        customerId: session.user.entityId,
        customerAccessToken: session.user.customerAccessToken,
      });

      // Update the session with the B2B token
      await update({
        ...session,
        b2bToken,
      });

      setSuccess(true);
      console.log('B2B login successful, token:', b2bToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('B2B login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.customerAccessToken) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800">No customer access token available. Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">B2B Authentication</h3>
      
      <div className="mb-4">
        <p className="text-sm text-blue-700 mb-2">
          <strong>Customer ID:</strong> {session.user.entityId || 'Not available'}
        </p>
        <p className="text-sm text-blue-700 mb-2">
          <strong>Has Customer Token:</strong> {session.user.customerAccessToken ? 'Yes' : 'No'}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Has B2B Token:</strong> {session.b2bToken ? 'Yes' : 'No'}
        </p>
      </div>

      {!session.b2bToken && (
        <button
          onClick={handleB2BLogin}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Authenticating...' : 'Authenticate with B2B API'}
        </button>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-100 rounded border">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-100 rounded border">
          <p className="text-green-800 text-sm">B2B authentication successful!</p>
        </div>
      )}
    </div>
  );
} 