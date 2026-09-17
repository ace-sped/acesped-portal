import { Barlow_Condensed, Source_Sans_3, Lora } from 'next/font/google';

export const snrdbDisplay = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-snrdb-display',
});

export const snrdbBody = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-snrdb-body',
});

export const snrdbSerif = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-snrdb-serif',
});
