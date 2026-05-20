import { cn } from '@/lib/utils';

/** Category-card palette — explicit light/dark (matches CategoriesPage). */
export const surfaceCardCls = cn(
  'bg-white border border-[#e8e8e8]',
  'dark:bg-[#1a1a1a] dark:border-[#2d2d2d]',
  'transition-colors duration-200',
);

export const surfaceCardInteractiveCls = cn(
  surfaceCardCls,
  'hover:border-[#d1d5db] dark:hover:border-[#3a3a3a]',
);

/** Ring/border matching card bg — for avatars, status dots */
export const surfaceCardRingCls =
  'border-white dark:border-[#1a1a1a] ring-white dark:ring-[#1a1a1a]';
