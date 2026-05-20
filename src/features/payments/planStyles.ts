import { cn } from '@/lib/utils';
import {
  cabinetCardStaticCls,
  cabinetIconWrapCls,
  cabinetOutlineBtnCls,
  cabinetPrimaryBtnCls,
  cabinetTextMuted,
  cabinetTextTitle,
  FABER_ORANGE,
} from '@/lib/cabinetStyles';
import type { TariffPlan } from '@/features/auth/plan';

export const plansPageWrapCls = 'faber-page-enter min-h-screen bg-[hsl(var(--background))]';

export const plansPageInnerCls =
  'mx-auto w-full max-w-5xl px-4 pb-[max(3rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-16 lg:px-8';

export const plansHeroTitleCls =
  'text-2xl font-bold tracking-tight text-[#212529] dark:text-white sm:text-3xl md:text-4xl';

export const plansHeroSubtitleCls =
  'mx-auto max-w-2xl px-1 text-sm text-[#6C757D] dark:text-white/55 sm:text-base';

export const plansVerifyBannerCls = cn(
  'mb-6 rounded-[14px] border border-[#E97525]/35 bg-[#FFF8EB]/90 p-4 text-center sm:mb-8 sm:p-5',
  'dark:border-[#E97525]/30 dark:bg-[#E97525]/10',
);

export function planCardShellCls(options: {
  isCurrent: boolean;
  isHighlighted: boolean;
  tier: TariffPlan;
}): string {
  const { isCurrent, isHighlighted, tier } = options;
  return cn(
    cabinetCardStaticCls,
    'relative flex h-full min-h-[260px] flex-col p-4 sm:min-h-[280px] sm:p-5',
    tier === 'PREMIUM' && (isCurrent || isHighlighted) && 'ring-2 ring-[#E97525]/25',
    tier === 'VIP' && isHighlighted && !isCurrent && 'border-[#E97525]/40',
    isCurrent && 'border-[#E97525]/50',
  );
}

export function planIconWrapCls(tier: TariffPlan): string {
  if (tier === 'BASIC') {
    return cn(
      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
      'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.08] dark:text-white/55',
    );
  }
  if (tier === 'VIP') {
    return cabinetIconWrapCls;
  }
  return cn(
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
    'bg-[#E97525]/15 text-[#E97525] dark:bg-[#E97525]/20',
  );
}

export function planNameCls(tier: TariffPlan): string {
  return cn(
    'text-sm font-bold tracking-wide',
    tier === 'BASIC' && cabinetTextTitle,
    tier === 'VIP' && 'text-[#E97525]',
    tier === 'PREMIUM' && 'text-[#c45f1a] dark:text-[#f08540]',
  );
}

export function planBadgeCls(): string {
  return cn(
    'absolute -top-px right-4 rounded-b-xl rounded-t-none px-3 py-1.5 text-[11px] font-semibold',
    'bg-[#E97525] text-white',
  );
}

export function planCtaCls(variant: 'primary' | 'outline' | 'disabled'): string {
  if (variant === 'disabled') {
    return cn(
      cabinetOutlineBtnCls,
      'w-full cursor-default opacity-60 hover:bg-white hover:text-[#495057] hover:border-[#E9ECEF]',
      'dark:hover:bg-white/[0.04] dark:hover:text-white/70 dark:hover:border-white/12',
    );
  }
  if (variant === 'primary') {
    return cn(cabinetPrimaryBtnCls, 'w-full');
  }
  return cn(cabinetOutlineBtnCls, 'w-full');
}

export const planPriceCls = 'text-2xl font-bold text-[#212529] dark:text-white sm:text-3xl';
export const planStrikeCls = 'text-sm text-[#6C757D] line-through dark:text-white/45';
export const planDescCls = cn('mb-2 text-sm sm:mb-3', cabinetTextMuted);

export const comparisonTableCls = cn(cabinetCardStaticCls, 'overflow-hidden rounded-[18px]');
export const comparisonHeaderCellCls =
  'px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#6C757D] dark:text-white/50 sm:px-5';
export const comparisonPlanHeaderCls = (tier: 'basic' | 'vip' | 'premium') =>
  cn(
    'py-3 text-center text-[11px] font-bold sm:text-xs',
    tier === 'basic' && 'text-[#495057] dark:text-white/70',
    tier === 'vip' && 'text-[#E97525]',
    tier === 'premium' && 'text-[#c45f1a] dark:text-[#f08540]',
  );
export const comparisonRowCls = (even: boolean) =>
  cn(
    'grid grid-cols-[minmax(140px,1fr)_repeat(3,minmax(80px,100px))] border-b border-[#E9ECEF] last:border-b-0 sm:grid-cols-[1fr_repeat(3,_100px)] dark:border-white/10',
    even && 'bg-[#FAFBFC]/80 dark:bg-white/[0.02]',
  );
export const comparisonLabelCls =
  'min-w-0 px-4 py-3 text-[13px] text-[#212529] dark:text-white/90 sm:px-5';

export function comparisonCheckCls(tier: 'gray' | 'orange' | 'premium'): string {
  const base =
    'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border';
  if (tier === 'gray') {
    return cn(base, 'border-[#E9ECEF] bg-[#F1F3F5] text-[#6C757D] dark:border-white/12 dark:bg-white/[0.06] dark:text-white/70');
  }
  if (tier === 'orange') {
    return cn(base, 'border-[#E97525]/40 bg-[#FFF8EB] text-[#E97525] dark:border-[#E97525]/30 dark:bg-[#E97525]/15');
  }
  return cn(base, 'border-[#c45f1a]/40 bg-[#E97525]/12 text-[#c45f1a] dark:text-[#f08540]');
}

export function comparisonValuePillCls(tier: 'gray' | 'orange' | 'premium'): string {
  const base =
    'inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium';
  if (tier === 'gray') {
    return cn(base, 'text-[#495057] dark:text-white/70');
  }
  if (tier === 'orange') {
    return cn(base, 'border border-[#E97525]/35 bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12');
  }
  return cn(base, 'border border-[#E97525]/45 bg-[#E97525]/10 text-[#c45f1a] dark:text-[#f08540]');
}

export { FABER_ORANGE, cabinetTextTitle, cabinetTextMuted };
