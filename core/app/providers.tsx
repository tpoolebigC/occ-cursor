'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBuyerPortal = pathname?.startsWith('/buyer-portal');

  return (
    <SearchProvider>
      <Toaster position="top-right" />
      {children}
    </SearchProvider>
  );
}
