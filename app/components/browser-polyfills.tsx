'use client';

import { useEffect } from 'react';

export default function BrowserPolyfills() {
  useEffect(() => {
    const applyPolyfills = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      // Load only what older browsers may miss.
      // IntersectionObserver is Baseline — no polyfill needed.

      if (!('ResizeObserver' in window)) {
        const { default: ResizeObserverPolyfill } = await import('resize-observer-polyfill');
        if (!('ResizeObserver' in window)) {
          (window as Window & { ResizeObserver: typeof ResizeObserverPolyfill }).ResizeObserver = ResizeObserverPolyfill;
        }
      }

      if (!('scrollBehavior' in document.documentElement.style)) {
        const { polyfill } = await import('smoothscroll-polyfill');
        polyfill();
      }
    };

    void applyPolyfills();
  }, []);

  return null;
}
