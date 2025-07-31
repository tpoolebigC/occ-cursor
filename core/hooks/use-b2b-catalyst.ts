import { useCallback, useEffect, useState } from 'react';

import { b2bCatalystClient } from '../lib/b2b/catalyst-client';

// Types for B2B data
interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  customerGroup?: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: {
    amount: number;
    currencyCode: string;
  };
  createdAt: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: {
    amount: number;
    currencyCode: string;
  };
  createdAt: string;
  expiresAt: string;
}

interface B2BData {
  customer?: CustomerProfile;
  orders: Order[];
  quotes: Quote[];
  loading: boolean;
  error?: string;
}

export function useB2BCatalyst(customerAccessToken?: string) {
  const [data, setData] = useState<B2BData>({
    orders: [],
    quotes: [],
    loading: false,
  });

  const fetchCustomerProfile = useCallback(async () => {
    if (!customerAccessToken) return;

    try {
      const response = await b2bCatalystClient.getCustomerProfile(customerAccessToken);
      if (response.data?.customer) {
        setData(prev => ({ ...prev, customer: response.data.customer }));
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      setData(prev => ({ ...prev, error: 'Failed to load customer profile' }));
    }
  }, [customerAccessToken]);

  const fetchOrders = useCallback(async (limit = 10) => {
    if (!customerAccessToken) return;

    try {
      setData(prev => ({ ...prev, loading: true }));
      const response = await b2bCatalystClient.getCustomerOrders(customerAccessToken, limit);
      if (response.data?.customer?.orders?.edges) {
        const orders = response.data.customer.orders.edges.map((edge: any) => edge.node);
        setData(prev => ({ ...prev, orders, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Failed to load orders',
        loading: false 
      }));
    }
  }, [customerAccessToken]);

  const fetchQuotes = useCallback(async (limit = 10) => {
    if (!customerAccessToken) return;

    try {
      setData(prev => ({ ...prev, loading: true }));
      const response = await b2bCatalystClient.getCustomerQuotes(customerAccessToken, limit);
      if (response.data?.customer?.quotes?.edges) {
        const quotes = response.data.customer.quotes.edges.map((edge: any) => edge.node);
        setData(prev => ({ ...prev, quotes, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Failed to load quotes',
        loading: false 
      }));
    }
  }, [customerAccessToken]);

  const refreshData = useCallback(async () => {
    if (!customerAccessToken) return;

    setData(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      await Promise.all([
        fetchCustomerProfile(),
        fetchOrders(),
        fetchQuotes(),
      ]);
    } catch (error) {
      console.error('Error refreshing B2B data:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Failed to refresh data',
        loading: false 
      }));
    }
  }, [customerAccessToken, fetchCustomerProfile, fetchOrders, fetchQuotes]);

  // Auto-fetch data when token changes
  useEffect(() => {
    if (customerAccessToken) {
      refreshData();
    } else {
      setData({ orders: [], quotes: [], loading: false });
    }
  }, [customerAccessToken, refreshData]);

  return {
    ...data,
    refreshData,
    fetchOrders,
    fetchQuotes,
    fetchCustomerProfile,
  };
} 