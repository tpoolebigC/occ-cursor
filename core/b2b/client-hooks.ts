'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCustomerInfo,
  getOrders,
  getQuotes,
  getProducts,
  searchProducts,
  type Customer,
  type Order,
  type Quote,
  type Product,
} from './server-actions';

// Base hook state interface
interface UseB2BState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseB2BReturn<T> extends UseB2BState<T> {
  refetch: () => Promise<void>;
}

// Customer hook
export function useCustomerInfo(customerAccessToken?: string): UseB2BReturn<Customer> {
  const [state, setState] = useState<UseB2BState<Customer>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCustomer = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getCustomerInfo(customerAccessToken);
      
      if (result.success && result.data) {
        setState({
          data: result.data.customer,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Failed to fetch customer info',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [customerAccessToken]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    ...state,
    refetch: fetchCustomer,
  };
}

// Orders hook
export function useOrders(
  first: number = 10,
  after?: string,
  customerAccessToken?: string
): UseB2BReturn<{ orders: { edges: { node: Order }[] } }> {
  const [state, setState] = useState<UseB2BState<{ orders: { edges: { node: Order }[] } }>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getOrders(first, after, customerAccessToken);
      
      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Failed to fetch orders',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [first, after, customerAccessToken]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    ...state,
    refetch: fetchOrders,
  };
}

// Quotes hook
export function useQuotes(
  first: number = 10,
  after?: string,
  customerAccessToken?: string
): UseB2BReturn<{ quotes: { edges: { node: Quote }[] } }> {
  const [state, setState] = useState<UseB2BState<{ quotes: { edges: { node: Quote }[] } }>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchQuotes = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getQuotes(first, after, customerAccessToken);
      
      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Failed to fetch quotes',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [first, after, customerAccessToken]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return {
    ...state,
    refetch: fetchQuotes,
  };
}

// Products hook
export function useProducts(
  first: number = 10,
  after?: string,
  searchTerm?: string,
  customerAccessToken?: string
): UseB2BReturn<{ products: { edges: { node: Product }[] } }> {
  const [state, setState] = useState<UseB2BState<{ products: { edges: { node: Product }[] } }>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getProducts(first, after, searchTerm, customerAccessToken);
      
      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Failed to fetch products',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [first, after, searchTerm, customerAccessToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    refetch: fetchProducts,
  };
}

// Search products hook with debouncing
export function useSearchProducts(
  searchTerm: string,
  first: number = 20,
  customerAccessToken?: string
): UseB2BReturn<{ products: { edges: { node: Product }[] } }> {
  const [state, setState] = useState<UseB2BState<{ products: { edges: { node: Product }[] } }>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchProducts = useCallback(async () => {
    if (!searchTerm.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await searchProducts(searchTerm, first, customerAccessToken);
      
      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Failed to search products',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [searchTerm, first, customerAccessToken]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchProducts]);

  return {
    ...state,
    refetch: searchProducts,
  };
}

// Generic hook for any B2B server action
export function useB2BServerAction<T>(
  action: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: any[] = []
): UseB2BReturn<T> {
  const [state, setState] = useState<UseB2BState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const executeAction = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await action();
      
      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Operation failed',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [action]);

  useEffect(() => {
    executeAction();
  }, [executeAction, ...dependencies]);

  return {
    ...state,
    refetch: executeAction,
  };
} 