import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'chunk-reload-ts';
const RELOAD_COOLDOWN_MS = 10_000;

export function isChunkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    error.name === 'ChunkLoadError'
  );
}

/**
 * Purge all SW caches so the next navigation fetch hits the network
 * and gets the fresh index.html with correct chunk references.
 */
async function purgeSwCaches(): Promise<void> {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // best-effort
  }
}

async function forceReloadOnce(): Promise<never> {
  const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  if (Date.now() - lastReload > RELOAD_COOLDOWN_MS) {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    await purgeSwCaches();
    window.location.reload();
  }
  throw new Error('Chunk load failed after reload — please clear your cache.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      if (!isChunkError(err)) throw err;
      return factory().catch(async (retryErr: unknown) => {
        if (isChunkError(retryErr)) await forceReloadOnce();
        throw retryErr;
      });
    }),
  );
}
