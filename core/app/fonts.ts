import { Inter, Roboto_Mono, Source_Sans_3 } from 'next/font/google';

export const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-inter',
});

export const sourceSans = Source_Sans_3({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-family-source-sans',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-roboto-mono',
});

export const fonts = [inter, sourceSans, robotoMono];
