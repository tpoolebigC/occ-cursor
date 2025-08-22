import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { B2BLoader } from '~/b2b/loader';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      {/* Inject Buyer Portal scripts (local or production) */}
      <B2BLoader />
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}

export const experimental_ppr = true;
