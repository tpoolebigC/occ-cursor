// Makeswift Use Products Hook
// React hook for managing products in Makeswift components

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useProducts(params: { collection: string; collectionLimit?: number; additionalProductIds?: string[] }) {
  const { collection, collectionLimit = 10 } = params;
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Don't fetch if session is still loading
    if (status === 'loading') {
      return;
    }

    async function fetchProducts() {
      try {
        setIsLoading(true);
        let productData;
        
        // Use API endpoints instead of direct client calls
        let response;
        
        switch (collection) {
          case 'best-selling':
            response = await fetch('/api/products/best-selling');
            break;
          case 'featured':
            response = await fetch('/api/products/featured');
            break;
          case 'newest':
            response = await fetch('/api/products/newest');
            break;
          default:
            response = await fetch('/api/products/featured');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        productData = await response.json();
        
        if (productData.status === 'success') {
          setProducts(productData.products || []);
        } else {
          setError(productData.error);
        }
      } catch (err) {
        setError(err as any);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [collection, collectionLimit, status]);

  return { products, isLoading, error };
} 