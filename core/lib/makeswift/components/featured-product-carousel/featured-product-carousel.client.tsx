'use client';

import { forwardRef, type Ref } from 'react';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';

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
}

export const MakeswiftFeaturedProductCarousel = forwardRef(
  ({ 
    title, 
    description, 
    cta, 
    nextLabel, 
    previousLabel, 
    emptyStateTitle, 
    emptyStateSubtitle 
  }: Props, ref: Ref<HTMLDivElement>) => {
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
          products={[]} // This will be populated by the actual data from the page
        />
      </div>
    );
  },
);

MakeswiftFeaturedProductCarousel.displayName = 'MakeswiftFeaturedProductCarousel'; 