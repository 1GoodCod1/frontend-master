/**
 * Extract the master profile ID from the `me` object stored in auth state.
 * Handles both `masterProfile.id` and `master.id` shapes.
 */
export function getCurrentUserMasterId(me: unknown): string | undefined {
  if (!me || typeof me !== 'object') return undefined;
  const rec = me as {
    masterProfile?: { id?: unknown } | null;
    master?: { id?: unknown } | null;
  };
  const id1 = rec.masterProfile?.id;
  if (typeof id1 === 'string') return id1;
  const id2 = rec.master?.id;
  if (typeof id2 === 'string') return id2;
  return undefined;
}
