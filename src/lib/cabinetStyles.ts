import { cn } from '@/lib/utils';
import { surfaceCardCls, surfaceCardInteractiveCls } from '@/lib/surfaceCard';

export const FABER_ORANGE = '#E97525';
export const FABER_ORANGE_HOVER = '#d86920';

/** Outer page wrapper — layout shell already provides px/py. */
export const cabinetPageClassName = 'mx-auto max-w-6xl space-y-6';

/** Dashboard / analytics — wider content column. */
export const cabinetPageWideClassName =
  'mx-auto w-full max-w-[1400px] space-y-6 sm:space-y-8 min-h-[calc(100vh-4rem)]';

export const cabinetPageNarrowClassName = 'mx-auto max-w-2xl space-y-6';

export const cabinetPageMediumClassName = 'mx-auto max-w-3xl space-y-6';

export const cabinetPageBookingsClassName = 'mx-auto w-full max-w-7xl space-y-6';

export const cabinetCardCls = cn(
  surfaceCardInteractiveCls,
  'rounded-[18px] transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10',
);

export const cabinetCardStaticCls = cn(surfaceCardCls, 'rounded-[18px]');

export const cabinetIconWrapCls =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12';

export const cabinetTextTitle = 'text-[#212529] dark:text-white';
export const cabinetTextBody = 'text-[13px] leading-snug text-[#495057] dark:text-white/70';
export const cabinetTextMuted = 'text-[12px] leading-snug text-[#6C757D] dark:text-white/50';

export const cabinetSectionTitleCls =
  'text-base font-semibold tracking-tight text-[#212529] dark:text-white';

export const cabinetInsetPanelCls = cn(
  'rounded-xl border border-[#e8e8e8] bg-[hsl(var(--secondary)/0.35)] p-4',
  'dark:border-[#2d2d2d] dark:bg-white/[0.03]',
);

export const cabinetPrimaryBtnCls = cn(
  'inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-4',
  'text-[13px] font-semibold whitespace-nowrap',
  'bg-[#E97525] text-white hover:bg-[#d86920] shadow-none transition-colors',
);

export const cabinetOutlineBtnCls = cn(
  'inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-4',
  'text-[13px] font-medium border-2 shadow-none transition-colors',
  'border-[#E9ECEF] bg-white text-[#495057]',
  'hover:bg-[#E97525]/10 hover:text-[#c45f1a] hover:border-[#E97525]/35',
  'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
  'dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/20',
);

export const cabinetLinkCls =
  'font-semibold text-[#E97525] hover:text-[#d86920] dark:text-[#E97525] dark:hover:text-[#f08540]';

export const cabinetBadgeCls = cn(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
  'text-[10px] font-medium uppercase tracking-wide',
  'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55',
);

export function cabinetFilterPillCls(active: boolean): string {
  return cn(
    'h-8 rounded-[10px] px-3 text-[13px] font-medium transition-colors shadow-none',
    active
      ? 'bg-[#E97525] text-white hover:bg-[#d86920]'
      : cn(
          'border border-[#E9ECEF] bg-white text-[#495057]',
          'hover:bg-[#E97525]/10 hover:text-[#c45f1a] hover:border-[#E97525]/35',
          'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/70',
          'dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/20',
        ),
  );
}

export const cabinetFormLabelCls =
  'text-[13px] font-semibold text-[#212529] dark:text-white';

export const cabinetInputCls = cn(
  'flex h-10 w-full rounded-[12px] border border-[#E9ECEF] bg-white px-3 text-[13px] text-[#495057]',
  'placeholder:text-[#6C757D]/70 shadow-none transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E97525]/20 focus-visible:border-[#E97525]/45',
  'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
);

export const cabinetTextareaCls = cn(
  'flex w-full rounded-[12px] border border-[#E9ECEF] bg-white px-3 py-2 text-[13px] leading-relaxed text-[#495057] resize-none',
  'placeholder:text-[#6C757D]/70 shadow-none transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E97525]/20 focus-visible:border-[#E97525]/45',
  'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
);

export const cabinetSelectTriggerCls = cn(
  'h-10 rounded-[12px] border-[#E9ECEF] bg-white text-[13px] text-[#495057] shadow-none',
  'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
);

export const cabinetFormCardCls = cn(cabinetCardStaticCls, 'p-6 sm:p-8');

export const cabinetDialogContentCls = cn(
  'rounded-[18px] border-[#E9ECEF] bg-white p-0 gap-0',
  'dark:border-white/12 dark:bg-[hsl(var(--cabinet-card-bg))]',
);

export const cabinetChoiceCardCls = (active: boolean) =>
  cn(
    'group relative overflow-hidden rounded-[14px] border-2 p-4 text-left transition-all duration-200',
    active
      ? 'border-[#E97525] bg-[#FFF8EB]/80 shadow-sm dark:bg-[#E97525]/10'
      : cn(
          'border-[#E9ECEF] bg-white hover:border-[#E97525]/35 hover:bg-[#E97525]/5',
          'dark:border-white/12 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]',
        ),
  );
