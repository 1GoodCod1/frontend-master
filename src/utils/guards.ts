/**
 * Type guard: checks if value is a non-null object (Record<string, unknown>).
 * Single source of truth - import from here instead of defining locally.
 */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
