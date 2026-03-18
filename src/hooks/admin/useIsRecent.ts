import { useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';

const RECENT_TTL_MS = 2 * 60 * 1000;

type RecentEntity = 'leads' | 'reviews';

/**
 * Returns a function to check if an entity ID was recently received via socket.
 * Used in admin Leads and Reviews pages for "new" badge styling.
 */
export function useIsRecent(entity: RecentEntity): (id: unknown) => boolean {
  const recent = useAppSelector((s) => s.socket.recent[entity]);

  return useCallback(
    (id: unknown) => {
      const key = String(id ?? '');
      const ts = recent[key];
      if (!ts) return false;
      return Date.now() - ts < RECENT_TTL_MS;
    },
    [recent],
  );
}
