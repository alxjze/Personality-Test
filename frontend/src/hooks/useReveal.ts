import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Staggered scroll-reveal for elements marked with `data-reveal` (optional `data-reveal-delay` in ms).
 * Content stays visible without JS or with reduced motion; it only animates when this hook runs.
 */
export function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const observe = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
        const d = el.dataset.revealDelay;
        if (d) el.style.setProperty('--reveal-delay', `${d}ms`);
        io.observe(el);
      });
    };
    observe();
    // Pick up content rendered after async loads.
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
}
