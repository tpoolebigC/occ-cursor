import { Page } from '~/lib/makeswift/page';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TestMakeswiftPage({ params }: Props) {
  const { locale } = await params;

  return <Page path="/test-makeswift" locale={locale} />;
} 