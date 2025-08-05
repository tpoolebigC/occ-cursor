'use client';

import { useState, useEffect } from 'react';
import { 
  getCustomerInfo, 
  getOrders, 
  getQuotes, 
  getInvoices, 
  searchAlgoliaProducts,
  type Customer,
  type Order,
  type Quote,
  type Invoice,
  type AlgoliaProduct
} from './server-actions';

// Custom hook for B2B server actions
function useB2BServerAction<T>(
  action: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await action();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}

// Customer info hook
export function useCustomerInfo() {
  return useB2BServerAction(() => getCustomerInfo());
}

// Orders hook
export function useOrders(first: number = 10, after?: string) {
  return useB2BServerAction(() => getOrders(first, after), [first, after]);
}

// Quotes hook
export function useQuotes() {
  return useB2BServerAction(() => getQuotes());
}

// Invoices hook
export function useInvoices(first: number = 10, after?: string) {
  return useB2BServerAction(() => getInvoices(first, after), [first, after]);
}

// Algolia search hook with debouncing
export function useAlgoliaSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [data, setData] = useState<AlgoliaProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await searchAlgoliaProducts(debouncedQuery);
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return { data, loading, error };
} 