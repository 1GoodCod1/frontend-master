import { useState, useEffect, useCallback } from 'react';
import type { AdminPaginationMeta } from '@/utils/data';

/**
 * Shared cursor-based pagination state for admin hooks.
 *
 * **Overload 1** (legacy): `useAdminCursors(meta, page)` — meta fed directly.
 * **Overload 2** (preferred): `useAdminCursors(page)` — call `updateMeta(meta)` after parsing.
 */
export function useAdminCursors(
  metaOrPage: AdminPaginationMeta | undefined | number,
  maybePage?: number,
) {
  // Resolve overload
  const isLegacy = maybePage !== undefined;
  const page = isLegacy ? maybePage : (metaOrPage as number);
  const legacyMeta = isLegacy ? (metaOrPage as AdminPaginationMeta | undefined) : undefined;

  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({
    1: undefined,
  });

  const storeCursor = useCallback(
    (meta: AdminPaginationMeta | undefined) => {
      const next =
        meta && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
      if (!next) return;
      queueMicrotask(() =>
        setPageCursors((prev) =>
          prev[page + 1] === next ? prev : { ...prev, [page + 1]: next },
        ),
      );
    },
    [page],
  );

  // Legacy: automatically store cursor from meta prop
  useEffect(() => {
    if (isLegacy) storeCursor(legacyMeta);
  }, [isLegacy, legacyMeta, storeCursor]);

  const resetCursors = useCallback(() => setPageCursors({ 1: undefined }), []);

  const cursor =
    typeof pageCursors[page] === 'string' && pageCursors[page]
      ? pageCursors[page]
      : undefined;

  return { cursor, resetCursors, updateMeta: storeCursor };
}
