'use client';

import { useState } from 'react';
import { CreateQuoteModal } from './CreateQuoteModal';

interface CreateQuoteButtonProps {
  locale: string;
}

export function CreateQuoteButton({ locale }: CreateQuoteButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (quote: { id: number; createdAt?: number | string; uuid?: string | null }) => {
    const date = quote.createdAt != null ? String(quote.createdAt) : '';
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    const url = `/${locale}/custom-dashboard/quotes/${quote.id}${qs}`;
    // Full navigation avoids SPA revalidation abort ("Failed to fetch")
    window.location.href = url;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Quote
      </button>
      {open && (
        <CreateQuoteModal
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
