import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import '../globals.css';

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
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 