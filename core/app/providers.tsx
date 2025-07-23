'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

export function Providers({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isBuyerPortal = pathname?.startsWith('/buyer-portal');

  return (
    <>
      <Toaster position="top-right" />
      <CartProvider>
        {isBuyerPortal ? (
          children
        ) : (
          <CompareDrawerProvider>{children}</CompareDrawerProvider>
        )}
      </CartProvider>
    </>
  );
}
