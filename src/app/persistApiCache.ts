import { createTransform, type PersistedState } from 'redux-persist';

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

export const API_CACHE_PERSIST_VERSION = 3;

/** Keys to purge on migration (stale data in normal browser) */
const PURGE_QUERY_PREFIXES = [
  'categoriesList',
  'categoriesWithCounts',
  'categoriesById',
  'mastersPopular',
  'mastersNew',
];

function purgeQueries(queries: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(queries)) {
    const shouldPurge = PURGE_QUERY_PREFIXES.some((p) => key.startsWith(p));
    if (!shouldPurge) filtered[key] = value;
  }
  return filtered;
}

export function migrateApiCache(
  state: PersistedState,
  _version: number
): Promise<PersistedState> {
  if (!state || typeof state !== 'object') return Promise.resolve(state as PersistedState);
  const s = state as Record<string, unknown> & { _persist?: { version?: number } };
  const storedVersion = s._persist?.version ?? 0;
  if (storedVersion >= API_CACHE_PERSIST_VERSION) return Promise.resolve(state);
  const queries = s.queries;
  if (queries && typeof queries === 'object') {
    const migrated = { ...s, queries: purgeQueries(queries as Record<string, unknown>) };
    return Promise.resolve(migrated as unknown as PersistedState);
  }
  return Promise.resolve(state);
}
