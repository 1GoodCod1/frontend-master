import { useState, useEffect, useCallback } from 'react';
import type { AdminPaginationMeta } from '@/utils/data';

/**
 * Shared cursor-based pagination state for admin hooks.
 * Stores nextCursor from API response in pageCursors[page+1] for use when requesting next page.
 * Call resetCursors() when filters change (parent should also setPage(1)).
 */
export function useAdminCursors(
  meta: AdminPaginationMeta | undefined,
  page: number,
) {
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({
    1: undefined,
  });

  useEffect(() => {
    const next =
      meta && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    queueMicrotask(() =>
      setPageCursors((prev) =>
        prev[page + 1] === next ? prev : { ...prev, [page + 1]: next },
      ),
    );
  }, [page, meta]);

  const resetCursors = useCallback(() => setPageCursors({ 1: undefined }), []);

  const cursor =
    typeof pageCursors[page] === 'string' && pageCursors[page]
      ? pageCursors[page]
      : undefined;

  return { cursor, resetCursors };
}
