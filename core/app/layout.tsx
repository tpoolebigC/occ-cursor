import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { SiteTheme } from '~/features/makeswift/components/site-theme';
import { fonts } from './fonts';
import { clsx } from 'clsx';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Buyer Portal',
  description: 'B2B Buyer Portal for managing customers, orders, and quotes',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={clsx(fonts.map((f) => f.variable))} lang="en">
      <head>
        <SiteTheme />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 