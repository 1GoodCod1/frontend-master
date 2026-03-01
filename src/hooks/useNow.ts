import { useSyncExternalStore } from 'react';

let now = typeof Date !== 'undefined' ? Date.now() : 0;
const listeners = new Set<() => void>();

const intervalMs = 60_000; // 1 minute - enough for "is expired" checks
if (typeof window !== 'undefined') {
  const id = setInterval(() => {
    now = Date.now();
    listeners.forEach((cb) => cb());
  }, intervalMs);
  if (id.unref) id.unref();
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
