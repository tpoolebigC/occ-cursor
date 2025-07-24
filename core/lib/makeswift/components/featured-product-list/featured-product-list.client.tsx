'use client';

import { forwardRef, type Ref } from 'react';
import { FeaturedProductList } from '@/vibes/soul/sections/featured-product-list';

interface Props {
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
  emptyStateTitle: string;
  emptyStateSubtitle: string;
}

export const MakeswiftFeaturedProductList = forwardRef(
  ({ title, description, cta, emptyStateTitle, emptyStateSubtitle }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <FeaturedProductList
          cta={cta}
          description={description}
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          title={title}
          products={[]} // This will be populated by the actual data from the page
        />
      </div>
    );
  },
);

MakeswiftFeaturedProductList.displayName = 'MakeswiftFeaturedProductList'; 