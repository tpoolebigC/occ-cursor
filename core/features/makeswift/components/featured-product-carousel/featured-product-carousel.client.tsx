'use client';

import { forwardRef, type Ref } from 'react';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { useProducts } from '../../utils/use-products';

interface Props {
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
  nextLabel: string;
  previousLabel: string;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  productGroup?: 'best-selling' | 'featured' | 'newest';
  maxProducts?: number;
  className?: string;
}

export const MakeswiftFeaturedProductCarousel = forwardRef(
  ({ 
    title, 
    description, 
    cta, 
    nextLabel, 
    previousLabel, 
    emptyStateTitle, 
    emptyStateSubtitle,
    productGroup = 'newest',
    maxProducts = 12
  }: Props, ref: Ref<HTMLDivElement>) => {
    const { products, isLoading } = useProducts({
      collection: productGroup,
      collectionLimit: maxProducts,
      additionalProductIds: [],
    });

    if (isLoading || !products) {
      return (
        <div ref={ref} style={{ width: '100%' }}>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4 w-64 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-8 w-96 mx-auto"></div>
                <div className="flex space-x-4 justify-center">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-48 h-64 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <FeaturedProductCarousel
          cta={cta}
          description={description}
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          nextLabel={nextLabel}
          previousLabel={previousLabel}
          title={title}
          products={products}
        />
      </div>
    );
  },
);

MakeswiftFeaturedProductCarousel.displayName = 'MakeswiftFeaturedProductCarousel'; 