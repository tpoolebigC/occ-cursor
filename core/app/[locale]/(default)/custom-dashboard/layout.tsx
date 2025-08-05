import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function CustomDashboardLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Dashboard Layout - No Header/Footer from root layout */}
      {children}
    </div>
  );
}

export const experimental_ppr = true; 