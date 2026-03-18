import { isRecord } from '@/utils/guards';

/** Extract user-friendly message from API/RTK/Error objects. */
export function toErrorMessage(e: unknown): string | undefined {
  if (e == null) return undefined;
  if (typeof e === 'string') return e;
  if (!isRecord(e)) return undefined;
  const data = isRecord(e.data) ? e.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof e.message === 'string' ? e.message : undefined)
  );
}
