import { isRecord } from '@/utils/guards';

export function now() {
  return Date.now();
}

export function makeId() {
  return `${now()}_${Math.random().toString(16).slice(2)}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isNotificationIdFromBackend(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export function pickId(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const v = payload.id ?? payload.leadId ?? payload.reviewId ?? payload.entityId;
  if (v === undefined || v === null) return undefined;
  return String(v);
}

export function pruneRecent(map: Record<string, number>, t: number) {
  for (const [k, ts] of Object.entries(map)) {
    if (t - ts > 2 * 60 * 1000) delete map[k];
  }
}
