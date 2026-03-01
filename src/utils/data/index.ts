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
  if (Array.isArray(r.items)) return r.items as T[];
  if (Array.isArray(r.rows)) return r.rows as T[];

  const nested = (r.data ?? r.result ?? null) as unknown;
  if (Array.isArray(nested)) return nested as T[];
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>;
    if (Array.isArray(n.items)) return n.items as T[];
  }
  return [];
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
