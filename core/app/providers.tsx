'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBuyerPortal = pathname?.startsWith('/buyer-portal');

  return (
    <SessionProvider>
      <SearchProvider>
        <Toaster position="top-right" />
        {children}
      </SearchProvider>
    </SessionProvider>
  );
}
