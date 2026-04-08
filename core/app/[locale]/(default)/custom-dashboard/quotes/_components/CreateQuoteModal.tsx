'use client';

import { useState, useEffect } from 'react';
import { searchProducts, createQuoteWithProducts, type QuoteLineItemInput } from '~/b2b/server-actions';

interface CreateQuoteModalProps {
  onClose: () => void;
  onSuccess: (quote: { id: number; createdAt?: number | string; uuid?: string | null }) => void;
}

interface LineItem extends QuoteLineItemInput {
  key: string;
}

export function CreateQuoteModal({ onClose, onSuccess }: CreateQuoteModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ productId: number; name: string; sku: string; price: number; salePrice?: number; imageUrl?: string } | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [quoteTitle, setQuoteTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addProduct = (product: { productId: number; name: string; sku: string; price: number; salePrice?: number; imageUrl?: string }, quantity: number) => {
    const offered = product.salePrice ?? product.price;
    const key = `${product.productId}-${Date.now()}`;
    setLineItems((prev) => [
      ...prev,
      {
        key,
        productId: product.productId,
        variantId: 0,
        sku: product.sku,
        productName: product.name,
        quantity,
        basePrice: product.price,
        offeredPrice: offered,
        imageUrl: product.imageUrl,
      },
    ]);
    setSelectedProduct(null);
    setAddQuantity(1);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) return;
    setLineItems((prev) => prev.map((item) => (item.key === key ? { ...item, quantity } : item)));
  };

  const removeLine = (key: string) => {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  };

  const subtotal = lineItems.reduce((sum, i) => sum + i.offeredPrice * i.quantity, 0);
  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const handleCreate = async () => {
    if (lineItems.length === 0) {
      setError('Add at least one product to the quote.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await createQuoteWithProducts(lineItems, quoteTitle || undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.errors?.length) {
        const messages = result.errors.map((e: { message?: string; productId?: number }) =>
          e.message ?? `Product validation failed${e.productId != null ? ` (product ID: ${e.productId})` : ''}`,
        );
        setError(messages.join('; '));
        return;
      }
      if (result.quote?.id) {
        onSuccess(result.quote);
      } else {
        setError('Quote was created but could not open it.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Create Quote</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote title (optional)</label>
              <input
                type="text"
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                placeholder="e.g. February order"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add products</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searching && (
                <p className="mt-1 text-sm text-gray-500">Searching...</p>
              )}
              {searchResults.length > 0 && (
                <ul className="mt-2 border border-gray-200 rounded-md divide-y max-h-48 overflow-y-auto">
                  {searchResults.map((product) => (
                    <li
                      key={product.objectID}
                      className={`flex items-center justify-between px-3 py-2 ${selectedProduct?.productId === product.productId ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <button
                        type="button"
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                        onClick={() => setSelectedProduct(selectedProduct?.productId === product.productId ? null : product)}
                      >
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku} · {formatPrice(product.salePrice ?? product.price)}</p>
                        </div>
                      </button>
                      {selectedProduct?.productId === product.productId ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="number"
                            min={1}
                            value={addQuantity}
                            onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-right"
                          />
                          <button
                            type="button"
                            onClick={() => addProduct(product, addQuantity)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Add to quote
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lineItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quote items ({lineItems.length})</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lineItems.map((item) => (
                        <tr key={item.key}>
                          <td className="px-3 py-2">
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.key, parseInt(e.target.value, 10) || 1)}
                              className="w-14 px-1 py-0.5 text-sm border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600">{formatPrice(item.offeredPrice)}</td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">{formatPrice(item.offeredPrice * item.quantity)}</td>
                          <td className="px-3 py-2">
                            <button type="button" onClick={() => removeLine(item.key)} className="text-red-600 hover:text-red-800 text-sm">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Subtotal: {formatPrice(subtotal)}</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting || lineItems.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
