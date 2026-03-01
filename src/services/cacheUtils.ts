function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

type ListContainer<T> =
  | T[]
  | { items: T[] }
  | { data: T[] }
  | { results: T[] }
  | { rows: T[] }
  | Record<string, unknown>;

function tryGetArrayField<T>(obj: Record<string, unknown>): T[] | null {
  const candidates = ['items', 'data', 'results', 'rows'] as const;
  for (const k of candidates) {
    const v = obj[k];
    if (Array.isArray(v)) return v as T[];
  }
  // fallback: first array field
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (Array.isArray(v)) return v as T[];
  }
  return null;
}

export function patchInListResponse<T>(
  draft: ListContainer<T> | undefined,
  predicate: (item: T) => boolean,
  patch: (item: T) => void,
): void {
  if (!draft) return;

  const apply = (arr: T[]) => {
    for (const it of arr) {
      if (predicate(it)) {
        patch(it);
        return true;
      }
    }
    return false;
  };

  if (Array.isArray(draft)) {
    apply(draft);
    return;
  }

  if (isRecord(draft)) {
    const arr = tryGetArrayField<T>(draft);
    if (arr) apply(arr);
  }
}

export function idMatches(item: unknown, id: string): boolean {
  if (!isRecord(item)) return false;
  const v = item.id ?? item._id ?? item.uuid;
  return v != null && String(v) === String(id);
}
