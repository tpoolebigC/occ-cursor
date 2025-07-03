import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { B2BLoader } from '~/components/b2b/b2b-loader';
import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <B2BLoader />
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}

export const experimental_ppr = true;
