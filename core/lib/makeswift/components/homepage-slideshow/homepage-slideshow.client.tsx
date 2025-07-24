'use client';

import { forwardRef, type Ref } from 'react';
import { Slideshow } from '@/vibes/soul/sections/slideshow';

interface Props {
  slides?: React.ReactNode;
  autoplay?: {
    enabled: string;
    interval: number;
  };
}

export const MakeswiftHomepageSlideshow = forwardRef(
  ({ slides, autoplay }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Slideshow />
      </div>
    );
  },
);

MakeswiftHomepageSlideshow.displayName = 'MakeswiftHomepageSlideshow'; 