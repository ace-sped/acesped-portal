import { Barlow_Condensed, Lora } from 'next/font/google';

export const snrdbDisplay = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-snrdb-display',
});

// Loaded with a stylesheet link. next/font cannot fetch Source Sans 3 during a Turbopack production build.
export const snrdbBody = {
  variable: 'snrdb-body-font',
};

export const snrdbSerif = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-snrdb-serif',
});
