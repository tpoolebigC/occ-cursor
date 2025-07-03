import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { B2BScript } from '~/components/b2b/b2b-script';
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
      <B2BScript />
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}

export const experimental_ppr = true;
