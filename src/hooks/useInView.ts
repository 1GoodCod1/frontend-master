import { useState, useEffect, useRef, useCallback } from 'react';

const defaultOptions = { rootMargin: '50px', threshold: 0.01 };

type ObserverEntry = { el: Element; cb: (visible: boolean) => void; once: boolean };

let sharedObserver: IntersectionObserver | null = null;
const observed = new Map<Element, ObserverEntry>();

function getObserver(rootMargin: string) {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rec = observed.get(entry.target);
          if (!rec) return;
          rec.cb(entry.isIntersecting);
          if (rec.once && entry.isIntersecting) {
            sharedObserver?.unobserve(entry.target);
            observed.delete(entry.target);
          }
        });
      },
      { ...defaultOptions, rootMargin },
    );
  }
  return sharedObserver;
}

/**
 * Shared IntersectionObserver for lazy loading. One observer instance serves many elements.
 * @param rootMargin - Margin around the viewport (default '50px')
 * @param once - If true, stop observing after first intersection (default true)
 */
export function useInView(rootMargin = '50px', once = true) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<Element | null>(null);
  const cbRef = useRef<((v: boolean) => void) | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      if (ref.current) {
        const obs = getObserver(rootMargin);
        obs.unobserve(ref.current);
        observed.delete(ref.current);
      }
      ref.current = node;
      if (node) {
        const cb = (visible: boolean) => {
          setIsInView((prev) => prev || visible);
        };
        cbRef.current = cb;
        observed.set(node, { el: node, cb, once });
        getObserver(rootMargin).observe(node);
      }
    },
    [rootMargin, once],
  );

  useEffect(
    () => () => {
      if (ref.current) {
        sharedObserver?.unobserve(ref.current);
        observed.delete(ref.current);
      }
    },
    [],
  );

  return [setRef, isInView] as const;
}
