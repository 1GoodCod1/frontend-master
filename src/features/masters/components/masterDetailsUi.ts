import { cn } from '@/lib/utils';

/** Shared surface for master public profile blocks */
export const masterDetailCardCls = cn(
  'bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08]',
  'rounded-[10px] shadow-sm transition-colors duration-300',
);

export const masterDetailInsetCls = 'rounded-[8px]';

export const masterDetailIconWrapCls = cn(
  masterDetailInsetCls,
  'flex h-9 w-9 items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
);
