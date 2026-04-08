'use client';

import { useState } from 'react';
import { checkoutQuote } from '~/b2b/server-actions';

interface QuoteCheckoutButtonProps {
  quoteId: number;
  quoteStatus: string;
}

export function QuoteCheckoutButton({ quoteId, quoteStatus }: QuoteCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for actionable statuses: New, In Process, Updated by Customer
  const actionableStatuses = ['new', 'in process', 'updated by customer'];
  const isActionable = actionableStatuses.some((s) => quoteStatus.toLowerCase().includes(s));

  if (!isActionable) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await checkoutQuote(quoteId);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.cartUrl) {
        window.location.href = result.cartUrl;
      } else {
        setError('No checkout URL was generated. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate checkout URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating checkout...
          </span>
        ) : (
          'Proceed to Checkout'
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
