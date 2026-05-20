import { cn } from '@/lib/utils';
import { FABER_ORANGE } from '@/lib/cabinetStyles';

export const CHAT_SHELL_CLS = cn(
  'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px]',
  'border border-[#E9ECEF] bg-white shadow-sm',
  'dark:border-white/10 dark:bg-[hsl(var(--cabinet-card-bg))]',
);

export const CHAT_SIDEBAR_CLS = cn(
  'flex w-[min(100%,280px)] shrink-0 flex-col overflow-hidden',
  'border-r border-[#E9ECEF] dark:border-white/10',
  'bg-[#FAFBFC] dark:bg-white/[0.02]',
);

export const CHAT_THREAD_AREA_CLS =
  'relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F5F7] dark:bg-black/20';

export const CHAT_ROW_SELECTED_CLS =
  'bg-[#E97525]/10 dark:bg-[#E97525]/12 border-l-2 border-[#E97525] pl-[10px]';

export const CHAT_ROW_IDLE_CLS =
  'border-l-2 border-transparent pl-[10px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]';

export const CHAT_BUBBLE_OWN_CLS = cn(
  'rounded-[18px] rounded-br-[6px] px-3 py-2 shadow-sm',
  'bg-[#E97525] text-white',
);

export const CHAT_BUBBLE_OTHER_CLS = cn(
  'rounded-[18px] rounded-bl-[6px] px-3 py-2 shadow-sm',
  'border border-[#E9ECEF] bg-white text-[#212529]',
  'dark:border-white/10 dark:bg-white/[0.08] dark:text-white/90',
);

export const CHAT_HEADER_CLS = cn(
  'flex h-12 shrink-0 items-center gap-2 border-b border-[#E9ECEF] px-3',
  'bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-[hsl(var(--cabinet-card-bg))]/95',
);

export const CHAT_INPUT_BAR_CLS = cn(
  'flex shrink-0 flex-col gap-1 border-t border-[#E9ECEF] px-2 py-2',
  'bg-white dark:border-white/10 dark:bg-[hsl(var(--cabinet-card-bg))]',
);

export const CHAT_SEARCH_CLS = cn(
  'h-9 w-full rounded-[10px] border border-[#E9ECEF] bg-white pl-9 pr-3',
  'text-[13px] text-[#495057] placeholder:text-[#6C757D]/80',
  'focus:outline-none focus:ring-2 focus:ring-[#E97525]/25 focus:border-[#E97525]/40',
  'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
);

/** Fits inside cabinet main (header, breadcrumbs, py, footer) without page scroll. */
export const CHAT_LAYOUT_HEIGHT_CLS =
  'h-[min(640px,calc(100dvh-11.5rem))] max-h-[calc(100dvh-11.5rem)]';

export const CHAT_LAYOUT_HEIGHT_MOBILE_CLS =
  'h-[min(560px,calc(100dvh-14.5rem))] max-h-[calc(100dvh-14.5rem)]';

export { FABER_ORANGE };
