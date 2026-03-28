import { useSyncExternalStore } from 'react';

let now = typeof Date !== 'undefined' ? Date.now() : 0;
const listeners = new Set<() => void>();

const intervalMs = 60_000; // 1 minute - enough for "is expired" checks
if (typeof window !== 'undefined') {
  const id = setInterval(() => {
    now = Date.now();
    listeners.forEach((cb) => cb());
  }, intervalMs);
  // id.unref() is Node.js-only and a no-op in browsers — use pagehide to release
  // the interval so the browser can garbage-collect and allow CPU idle states.
  window.addEventListener('pagehide', () => clearInterval(id), { once: true });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return now;
}

/** Current timestamp, updates every minute. Use instead of Date.now() in render for purity. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
