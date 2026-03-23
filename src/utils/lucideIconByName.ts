import * as Lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Резолвит компонент Lucide по имени экспорта (PascalCase), напр. Droplets, SparklesIcon.
 */
export function getLucideIconByName(name: string | null | undefined): LucideIcon | null {
  if (!name?.trim()) return null;
  const mod = Lucide as unknown as Record<string, LucideIcon | undefined>;
  const C = mod[name.trim()];
  return C ?? null;
}
