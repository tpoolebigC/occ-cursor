'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function AuthDebugger() {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-yellow-800">Authentication Debug</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          {isExpanded ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-yellow-700">
          <strong>Status:</strong> {status}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>Has Session:</strong> {session ? 'Yes' : 'No'}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>Has Customer Token:</strong> {session?.user?.customerAccessToken ? 'Yes' : 'No'}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>Has B2B Token:</strong> {session?.b2bToken ? 'Yes' : 'No'}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>User Email:</strong> {session?.user?.email || 'None'}
        </p>
      </div>

      {isExpanded && (
        <div className="mt-4 p-3 bg-yellow-100 rounded border">
          <h4 className="font-semibold text-yellow-800 mb-2">Full Session Data:</h4>
          <pre className="text-xs text-yellow-800 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 