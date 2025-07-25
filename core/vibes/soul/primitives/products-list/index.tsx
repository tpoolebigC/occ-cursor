'use client';

import { type BcProductSchema } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { clsx } from 'clsx';

import { ProductCard, mapBcProductToProduct } from '../product-card';

interface ProductsListProps {
  products: BcProductSchema[];
  className?: string;
}

export function ProductsList({ products, className }: ProductsListProps) {
  return (
    <div className={clsx('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.entityId} product={mapBcProductToProduct(product)} />
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