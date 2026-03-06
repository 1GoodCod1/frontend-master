import { createTransform } from 'redux-persist';

const PERSISTED_ENDPOINT_PREFIXES = [
  'categoriesList',
  'categoriesWithCounts',
  'categoriesById',
  'citiesList',
  'citiesById',
] as const;

function isPersistedQueryKey(key: string): boolean {
  return PERSISTED_ENDPOINT_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/**
 * Transform that persists only Categories and Cities RTK Query cache.
 * - inbound: filter when saving to localStorage
 * - outbound: pass through when rehydrating
 */
export const persistApiCacheTransform = createTransform(
  (state: unknown) => {
    if (!state || typeof state !== 'object') return state;
    const s = state as Record<string, unknown>;
    const queries = s.queries;
    if (!queries || typeof queries !== 'object') return state;

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(queries)) {
      if (isPersistedQueryKey(key)) {
        filtered[key] = value;
      }
    }
    return { ...s, queries: filtered };
  },
  null
);

export const API_CACHE_PERSIST_VERSION = 1;
