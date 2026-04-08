'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { getQuotes, getShoppingLists, addProductToQuote, addProductToShoppingList } from '~/b2b/server-actions';

interface B2BPdpActionsProps {
  productId: number;
  productName: string;
  sku: string;
  basePrice: number;
  imageUrl?: string;
  variantId?: number;
}

type Quote = { id: number | string; name: string; quoteNumber?: string; status?: string | number; statusLabel?: string };
type ShoppingList = { id: string; name: string };

export function B2BPdpActions({
  productId,
  productName,
  sku,
  basePrice,
  imageUrl,
  variantId,
}: B2BPdpActionsProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const result = await getQuotes();
      if (result.quotes) {
        const actionable = result.quotes.filter((q: any) => {
          const label = (q.statusLabel ?? String(q.status ?? '')).toLowerCase();
          return label.includes('new') || label.includes('in process') || label.includes('updated by customer') || q.status === 0 || q.status === 1;
        });
        setQuotes(
          actionable.map((q: any) => ({
            id: q.id,
            name: q.quoteTitle || q.quoteNumber || `Quote #${q.id}`,
            quoteNumber: q.quoteNumber,
            status: q.statusLabel || String(q.status),
          })),
        );
      }
    } catch {
      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchShoppingLists = async () => {
    setLoadingLists(true);
    try {
      const result = await getShoppingLists();
      if (result.shoppingLists) {
        setShoppingLists(
          result.shoppingLists.map((l: any) => ({
            id: String(l.id),
            name: l.name || `List #${l.id}`,
          })),
        );
      }
    } catch {
      setShoppingLists([]);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToQuote = (quoteId: number) => {
    startTransition(async () => {
      setMessage(null);
      const result = await addProductToQuote({
        quoteId,
        productId,
        variantId,
        sku,
        productName,
        quantity: 1,
        basePrice,
        offeredPrice: basePrice,
        imageUrl,
      });

      if (result.success) {
        setMessage({ type: 'success', text: `Added to quote successfully!` });
        setShowQuoteModal(false);
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Failed to add to quote' });
      }

      setTimeout(() => setMessage(null), 4000);
    });
  };

  const handleAddToShoppingList = (listId: string) => {
    startTransition(async () => {
      setMessage(null);
      const result = await addProductToShoppingList({
        listId,
        productId,
        variantId,
        quantity: 1,
      });

      if (result.success) {
        setMessage({ type: 'success', text: `Added to shopping list!` });
        setShowListModal(false);
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Failed to add to shopping list' });
      }

      setTimeout(() => setMessage(null), 4000);
    });
  };

  useEffect(() => {
    if (showQuoteModal) fetchQuotes();
  }, [showQuoteModal]);

  useEffect(() => {
    if (showListModal) fetchShoppingLists();
  }, [showListModal]);

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={() => setShowQuoteModal(true)}
          className="flex-1 rounded-full border-2 border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Add to quote
        </button>
        <button
          type="button"
          onClick={() => setShowListModal(true)}
          className="flex-1 rounded-full border-2 border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Add to shopping list
        </button>
      </div>

      {/* Toast message */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            message.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Quote Selection Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQuoteModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add to Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 max-h-80 overflow-y-auto">
              {loadingQuotes ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : quotes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No active quotes available. Create a new quote from the{' '}
                  <a href={`/${locale}/custom-dashboard/quotes`} className="text-indigo-600 hover:underline">
                    Quotes page
                  </a>.
                </p>
              ) : (
                <div className="space-y-2">
                  {quotes.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAddToQuote(Number(q.id))}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-gray-900">{q.name}</p>
                      <p className="text-xs text-gray-500">
                        {q.quoteNumber && `${q.quoteNumber} · `}
                        {q.status}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Selection Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowListModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add to Shopping List</h3>
              <button
                onClick={() => setShowListModal(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 max-h-80 overflow-y-auto">
              {loadingLists ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : shoppingLists.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No shopping lists found. Create one from the{' '}
                  <a href={`/${locale}/custom-dashboard/shopping-lists`} className="text-indigo-600 hover:underline">
                    Shopping Lists page
                  </a>.
                </p>
              ) : (
                <div className="space-y-2">
                  {shoppingLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAddToShoppingList(list.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-gray-900">{list.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
