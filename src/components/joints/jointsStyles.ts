import { cn } from '@/lib/utils';

export const JOINTS_BADGE_BASE = cn(
  'inline-flex max-w-full items-center rounded-[10px] border font-bold tabular-nums',
  'bg-gradient-to-br from-[#FFFBEB] via-[#FFF4D6] to-[#FFE8A3]',
  'border-[#E8C878]/75 text-[#92400E]',
  'shadow-[0_1px_2px_rgba(146,64,14,0.1),inset_0_1px_0_rgba(255,255,255,0.65)]',
  'dark:from-[#E97525]/22 dark:via-[#E97525]/14 dark:to-[#E97525]/8',
  'dark:border-[#E97525]/40 dark:text-[#FCD34D]',
  'dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]',
);

export const JOINTS_SIZE = {
  xs: {
    wrap: 'gap-0.5 px-1 py-0.5 text-[10px] leading-none',
    icon: 'size-3',
    label: 'text-[9px] font-semibold uppercase tracking-wide opacity-75',
  },
  sm: {
    wrap: 'gap-1 px-1.5 py-0.5 text-[11px] leading-none',
    icon: 'size-3.5',
    label: 'text-[10px] font-semibold uppercase tracking-wide opacity-75',
  },
  md: {
    wrap: 'gap-1.5 px-2 py-1 text-[13px] leading-none',
    icon: 'size-4',
    label: 'text-[11px] font-semibold uppercase tracking-wide opacity-80',
  },
  lg: {
    wrap: 'gap-2 px-3 py-1.5 text-sm leading-none',
    icon: 'size-[18px]',
    label: 'text-xs font-semibold uppercase tracking-wide opacity-80',
  },
} as const;
