import { createTransform, type PersistedState } from 'redux-persist';

export { API_CACHE_PERSIST_VERSION } from '@/constants';
import { PERSISTED_ENDPOINT_PREFIXES, API_CACHE_PERSIST_VERSION } from '@/constants';

/** RTK Query invalidation slice shape — `provided: {}` leaves `provided.tags` undefined and breaks invalidateTags (e.g. reading 'Me'). */
const EMPTY_RTQ_PROVIDED = { tags: {}, keys: {} } as const;

function isPersistedQueryKey(key: string): boolean {
  return PERSISTED_ENDPOINT_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/** Only categories/cities query cache — nothing else should live in localStorage. */
function filterQueriesForPersist(
  queries: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(queries)) {
    if (isPersistedQueryKey(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

/**
 * Transform that persists only Categories and Cities RTK Query cache.
 * - inbound: filter when saving to localStorage
 * - outbound: pass through when rehydrating
 *
 * Important: we also strip mutations / subscriptions / provided — otherwise they
 * were still serialized via `...s` (XSS-readable cache of unrelated API calls).
 */
function normalizeRtqProvided(state: unknown): unknown {
  if (!state || typeof state !== 'object') return state;
  const s = state as Record<string, unknown>;
  const p = s.provided;
  if (p && typeof p === 'object' && p !== null && !('tags' in p)) {
    return { ...s, provided: { ...EMPTY_RTQ_PROVIDED } };
  }
  return state;
}

export const persistApiCacheTransform = createTransform(
  (state: unknown) => {
    if (!state || typeof state !== 'object') return state;
    const s = state as Record<string, unknown>;
    const queries = s.queries;
    if (!queries || typeof queries !== 'object') return state;

    const filtered = filterQueriesForPersist(queries as Record<string, unknown>);
    return {
      ...s,
      queries: filtered,
      mutations: {},
      subscriptions: {},
      provided: { ...EMPTY_RTQ_PROVIDED },
    };
  },
  (state: unknown) => normalizeRtqProvided(state)
);


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
    const migrated = {
      ...s,
      queries: filterQueriesForPersist(queries as Record<string, unknown>),
      mutations: {},
      subscriptions: {},
      provided: { ...EMPTY_RTQ_PROVIDED },
    };
    return Promise.resolve(migrated as unknown as PersistedState);
  }
  return Promise.resolve(normalizeRtqProvided(state) as PersistedState);
}
