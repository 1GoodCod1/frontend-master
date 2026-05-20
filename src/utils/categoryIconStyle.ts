import { surfaceCardCls, surfaceCardInteractiveCls } from '@/lib/surfaceCard';
import { cn } from '@/lib/utils';
import { CATEGORY_EMOJI, CATEGORY_ICON_WRAP } from '@/constants/home';

export function resolveCategoryEmoji(slug: string, apiIcon?: string | null): string {
  const fromApi = apiIcon?.trim();
  if (fromApi) return fromApi;
  return CATEGORY_EMOJI[slug] ?? '📋';
}

export function getCategoryIconWrap(slug: string, colorClass: string): string {
  if (CATEGORY_ICON_WRAP[slug]) return CATEGORY_ICON_WRAP[slug];

  if (/cyan|sky|teal/.test(colorClass)) return 'bg-[#EBF5FF] dark:bg-sky-500/12';
  if (/rose|pink|fuchsia/.test(colorClass)) return 'bg-[#FDF0F5] dark:bg-rose-500/12';
  if (/amber|yellow|orange/.test(colorClass)) return 'bg-[#FFF8EB] dark:bg-amber-500/12';
  if (/emerald|green|lime/.test(colorClass)) return 'bg-[#ECFDF5] dark:bg-emerald-500/12';
  if (/blue|indigo|violet|purple/.test(colorClass)) return 'bg-[#EEF2FF] dark:bg-indigo-500/12';
  if (/slate|zinc|gray/.test(colorClass)) return 'bg-[#F1F5F9] dark:bg-white/[0.06]';
  return 'bg-[#F3F4F6] dark:bg-white/[0.08]';
}

export const categoryCardClassName = cn(
  surfaceCardInteractiveCls,
  'group flex flex-col h-[128px] rounded-[22px] p-4 cursor-pointer',
);

export const categoryCardSkeletonClassName = cn(
  surfaceCardCls,
  'rounded-[22px] p-4 flex flex-col h-[128px]',
);

export const categoriesGridClassName =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-stretch';

/** Homepage active jobs — 3 per row (Faber mock) */
export const homeJobsGridClassName =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full items-stretch';

export const homeJobCardClassName = cn(
  surfaceCardInteractiveCls,
  'group flex flex-col h-full min-h-[132px] rounded-[18px] p-4 cursor-pointer',
);

export const homeJobCardSkeletonClassName = cn(
  surfaceCardCls,
  'rounded-[18px] p-4 flex flex-col min-h-[132px] h-full',
);

/** Faber v2 — Discover section accent */
export const DISCOVER_SECTION_ACCENT = '#0EA5E9';

export { surfaceCardCls, surfaceCardInteractiveCls };
