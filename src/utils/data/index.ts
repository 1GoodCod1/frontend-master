import { isRecord } from '@/utils/guards';

/**
 * Unwraps API envelope { data: T } to T. Returns raw if no envelope.
 */
export function unwrapEnvelope(raw: unknown): unknown {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: unknown }).data;
    return d !== undefined ? d : raw;
  }
  return raw;
}

/**
 * Unwraps nested `{ data: … }` envelopes until an object with `totalLogs` is found (GET /audit/stats).
 */
export function unwrapAuditStatsPayload(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 8; i++) {
    if (!cur || typeof cur !== 'object') return null;
    const o = cur as Record<string, unknown>;
    if (typeof o.totalLogs === 'number') return o;
    if ('data' in o && o.data != null) {
      cur = o.data;
      continue;
    }
    return null;
  }
  return null;
}

/**
 * Typed wrapper: unwrapEnvelope + cast to T.
 */
export function unwrapObject<T>(raw: unknown): T {
  return unwrapEnvelope(raw) as T;
}

/**
 * Unwraps single value from envelope. Returns null for null/undefined input or empty envelope.
 */
export function unwrapOne<T>(raw: unknown): T | null {
  if (raw == null) return null;
  const d = unwrapEnvelope(raw);
  if (d === undefined || d === null) return null;
  return d as T;
}

/**
 * Extracts items array from various API response formats
 * Handles TransformInterceptor and typical wrapper formats like { data: T }
 */
export function extractItems<T = unknown>(resp: unknown): T[] {
  if (!resp) return [];
  if (typeof resp !== 'object') return [];

  // TransformInterceptor and typical wrapper { data: T }
  const obj = resp as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as T[];

  const root = (obj.data ?? resp) as unknown;
  if (Array.isArray(root)) return root as T[];
  if (!root || typeof root !== 'object') return [];

  const r = root as Record<string, unknown>;
  const arrayKeys = [
    'items',
    'rows',
    'leads',
    'masters',
    'reviews',
    'payments',
    'logs',
    'users',
    'categories',
    'cities',
  ];
  for (const key of arrayKeys) {
    if (Array.isArray(r[key])) return r[key] as T[];
  }

  const nested = (r.data ?? r.result ?? null) as unknown;
  if (Array.isArray(nested)) return nested as T[];
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.items)) return n.items as T[];
  }
  return [];
}

/**
 * Coerces unknown to number. Returns fallback when invalid.
 */
export function toNumber(v: unknown, fallback: number = 0): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** GET /admin/users/stats — aggregate counts for current filters. */
export type AdminUsersStatsSummary = {
  total: number;
  active: number;
  pending: number;
  blocked: number;
};

/**
 * Parses GET /admin/users/stats body: `{ total, stats: { active, pending, blocked } }`.
 */
export function parseAdminUsersStatsSummary(raw: unknown): AdminUsersStatsSummary {
  const d = unwrapEnvelope(raw);
  if (!isRecord(d)) {
    return { total: 0, active: 0, pending: 0, blocked: 0 };
  }
  const total = toNumber(d.total, 0);
  const s = isRecord(d.stats) ? d.stats : {};
  return {
    total,
    active: toNumber(s.active, 0),
    pending: toNumber(s.pending, 0),
    blocked: toNumber(s.blocked, 0),
  };
}

/** GET /admin/masters/stats */
export type AdminMastersStatsSummary = {
  total: number;
  verified: number;
  featured: number;
  avgRating: number;
};

/**
 * Parses GET /admin/masters/stats body: `{ total, stats: { verified, featured, avgRating } }`.
 */
export function parseAdminMastersStatsSummary(raw: unknown): AdminMastersStatsSummary {
  const d = unwrapEnvelope(raw);
  if (!isRecord(d)) {
    return { total: 0, verified: 0, featured: 0, avgRating: 0 };
  }
  const total = toNumber(d.total, 0);
  const s = isRecord(d.stats) ? d.stats : {};
  return {
    total,
    verified: toNumber(s.verified, 0),
    featured: toNumber(s.featured, 0),
    avgRating: toNumber(s.avgRating, 0),
  };
}

/**
 * Admin API response meta (pagination + nextCursor).
 */
export type AdminPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  nextCursor?: string | null;
};

/**
 * Parses admin paginated API response: unwraps envelope, extracts items, builds meta.
 * Single source of truth for admin hooks.
 */
export function parseAdminPaginatedResponse<T = unknown>(
  raw: unknown,
  fallback: { page: number; limit: number; total: number },
): { items: T[]; meta: AdminPaginationMeta } {
  const data = unwrapEnvelope(raw);
  const items = (extractItems(data) as unknown[]).filter(isRecord) as T[];
  const metaRaw = isRecord(data) ? (data.pagination ?? data.meta) : undefined;
  const meta: AdminPaginationMeta = isRecord(metaRaw)
    ? {
        page: toNumber(metaRaw.page, fallback.page),
        limit: toNumber(metaRaw.limit, fallback.limit),
        total: toNumber(metaRaw.total ?? metaRaw.count, fallback.total),
        totalPages: typeof metaRaw.totalPages === 'number' ? metaRaw.totalPages : undefined,
        nextCursor:
          typeof metaRaw.nextCursor === 'string' ? metaRaw.nextCursor : undefined,
      }
    : { ...fallback };
  return { items, meta };
}

export function unwrapList<T = unknown>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const data =
    obj && obj.data && typeof obj.data === 'object'
      ? (obj.data as Record<string, unknown>)
      : null;

  const candidates = [
    obj?.data,
    obj?.items,
    obj?.rows,
    obj?.results,
    obj?.list,
    data?.items,
    data?.rows,
    data?.results,
    data?.list,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as T[];
  }

  return [];
}
