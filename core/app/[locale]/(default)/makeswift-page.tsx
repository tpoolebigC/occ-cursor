import { Page } from '~/lib/makeswift/page';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MakeswiftHomePage({ params }: Props) {
  const { locale } = await params;

  return <Page path="/" locale={locale} />;
} 