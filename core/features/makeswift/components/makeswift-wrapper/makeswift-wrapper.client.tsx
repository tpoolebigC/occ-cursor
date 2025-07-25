'use client';

import { forwardRef, type Ref } from 'react';

interface Props {
  children: React.ReactNode;
}

export const MakeswiftWrapper = forwardRef(
  ({ children }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref}>
        {children}
      </div>
    );
  },
);

MakeswiftWrapper.displayName = 'MakeswiftWrapper'; 