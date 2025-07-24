'use client';

import { type Product } from '@bigcommerce/catalyst-client';
import { clsx } from 'clsx';

import { ProductCard } from '../product-card';

interface ProductsListProps {
  products: Product[];
  className?: string;
}

export function ProductsList({ products, className }: ProductsListProps) {
  return (
    <div className={clsx('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.entityId} product={product} />
      ))}
    </div>
  );
}

export function ProductsListSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
} 