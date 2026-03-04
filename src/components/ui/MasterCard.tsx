import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star,
  MapPin,
  ShieldCheck,
  Flame,
  Sparkles,
  Crown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import { mastersApi } from '@/features/masters/mastersApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import type { PublicMaster } from '@/types';

function StarRating({ value, compact }: { value: number; compact?: boolean }) {
  const fullStars = Math.floor(value);
  const decimal = value % 1;
  const sizeClass = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const gapClass = compact ? 'gap-0' : 'gap-0.5';

  return (
    <span className={cn('inline-flex items-center', gapClass)}>
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className={cn(sizeClass, 'fill-[#FFC107] text-[#FFC107] dark:fill-amber-400 dark:text-amber-400')}
            />
          );
        }
        if (i === fullStars && decimal > 0) {
          const pct = decimal * 100;
          return (
            <span key={i} className={cn('relative inline-block', sizeClass)}>
              <Star className={cn('absolute inset-0', sizeClass, 'text-muted-foreground/30 dark:text-muted-foreground/40')} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <Star className={cn(sizeClass, 'fill-[#FFC107] text-[#FFC107] dark:fill-amber-400 dark:text-amber-400')} />
              </span>
            </span>
          );
        }
        return (
          <Star
            key={i}
            className={cn(sizeClass, 'text-muted-foreground/30 dark:text-muted-foreground/40')}
          />
        );
      })}
    </span>
  );
}

type TariffType = 'BASIC' | 'VIP' | 'PREMIUM';

function normalizeTariffType(v: unknown): TariffType {
  if (typeof v !== 'string') return 'BASIC';
  const x = v.toUpperCase();
  if (x === 'VIP' || x === 'PREMIUM' || x === 'BASIC') return x;
  return 'BASIC';
}

type MasterCardProps = {
  master: PublicMaster;
  compact?: boolean;
  onlyAvatar?: boolean;
  reasons?: string[];
  sectionBadge?: 'popular' | 'new';
  /** Override: discount % for promotion badge (e.g. from home page active promotions) */
  promotionDiscount?: number;
};

export const MasterCard = React.memo(function MasterCard({
  master,
  compact: _compact = false,
  onlyAvatar = false,
  reasons: _reasons,
  sectionBadge,
  promotionDiscount: promotionDiscountProp,
}: MasterCardProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const now = useNow();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const masterId = master.slug ?? master.id;

  const handleMouseEnter = () => {
    if (masterId) {
      dispatch(
        mastersApi.util.prefetch('mastersById', { id: masterId }, { force: false })
      );
    }
  };

  const displayName =
    master?.displayName ||
    `${master?.user?.firstName || ''} ${master?.user?.lastName || ''}`.trim() ||
    master?.name ||
    t('common.masterCard.masterNameFallback');
  const city = getTranslatedCityName(t, master?.city) || master?.city?.name;
  const rating = master?.rating ?? master?.avgRating;
  const totalReviews = master?.totalReviews ?? 0;
  const categoryName = getTranslatedCategoryName(t, master?.category) || master?.category?.name;

  const avatarSrc = mediaUrl(
    master?.avatarUrl || master?.avatarFile?.path || null
  );

  const rawTariff = normalizeTariffType(
    master?.effectiveTariffType ??
      master?.tariffType ??
      (typeof master?.tariff === 'string' ? master.tariff : null) ??
      'BASIC'
  );
  const expRaw: unknown = master?.tariffExpiresAt ?? master?.planExpiresAt ?? null;
  const expMs =
    typeof expRaw === 'string' || expRaw instanceof Date
      ? new Date(expRaw).getTime()
      : 0;
  const isActivePaid =
    rawTariff !== 'BASIC' && !!expMs && expMs > now;
  const effectiveTariff: TariffType =
    rawTariff === 'BASIC' ? 'BASIC' : isActivePaid ? rawTariff : 'BASIC';

  const isVip = effectiveTariff === 'VIP';
  const isPremium = effectiveTariff === 'PREMIUM';
  const placeholderVariant = isVip ? 'vip' : isPremium ? 'premium' : 'default';
  const isVerified = (master?.user?.isVerified ?? master?.isVerified) === true;
  const activePromotion = master?.activePromotion ?? master?.promotions?.[0] ?? null;
  const activePromotionDiscount =
    typeof promotionDiscountProp === 'number'
      ? promotionDiscountProp
      : typeof activePromotion?.discount === 'number'
        ? activePromotion.discount
        : null;

  const serviceTags = useMemo(() => {
    const svc = master.services ?? [];
    return svc.slice(0, 2).map((s) => s.title || '').filter(Boolean);
  }, [master.services]);

  const badgeTooltipClass =
    'rounded-md px-2 py-1 text-xs bg-[hsl(var(--popover))] text-popover-foreground border-0 shadow-sm dark:shadow-black/40';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nav(`/masters/${master.slug ?? master.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nav(`/masters/${master.slug ?? master.id}`);
    }
  };

  if (onlyAvatar) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative flex h-20 w-20 shrink-0 cursor-pointer"
      >
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-white shadow-md dark:border-white/20">
          {avatarSrc ? (
            <LazyImage
              src={avatarSrc}
              alt={displayName}
              objectFit="cover"
              skeletonHeight={80}
              skeletonWidth={80}
              className="h-full w-full"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <AvatarPlaceholder role="master" height={80} variant={placeholderVariant} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-md shadow-slate-200/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/30 cursor-pointer',
        'dark:bg-[#1e1c17] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.25)]',
      )}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full shrink-0 bg-[#FFC107] dark:bg-amber-500" />

      <div className="flex flex-col p-4 pb-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
        {/* Top row: Avatar + Name + Badges */}
        <div className="flex items-start gap-3">
          {/* Avatar with online indicator */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md dark:border-white/20">
              {avatarSrc ? (
                <LazyImage
                  src={avatarSrc}
                  alt={displayName}
                  objectFit="cover"
                  skeletonHeight={64}
                  skeletonWidth={64}
                  className="h-full w-full"
                  style={{ borderRadius: '50%' }}
                />
              ) : (
                <AvatarPlaceholder role="master" height={64} variant={placeholderVariant} />
              )}
            </div>
            {master?.isOnline === true && (
              <span
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#1e1c17]"
                title={t('masters.availableNow')}
              />
            )}
          </div>

          {/* Name + profession */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-foreground text-base leading-tight truncate">
                {displayName}
              </span>
              {isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex shrink-0">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className={badgeTooltipClass}>
                      {t('masters.verified')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {categoryName && (
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                {categoryName}
              </p>
            )}
            {/* Rating — directly under category */}
            {typeof rating === 'number' && (
              <div className="mt-1 flex items-center gap-1">
                <StarRating value={rating} compact />
                <span className="text-xs font-medium text-foreground">
                  {rating.toFixed(1)}
                </span>
                {totalReviews > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Corner badges */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {activePromotionDiscount !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8D7DA] px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                <Flame className="h-3.5 w-3.5" />
                -{activePromotionDiscount}%
              </span>
            )}
            {sectionBadge === 'popular' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-amber-500">
                <Flame className="h-3.5 w-3.5" />
                {t('common.masterCard.popular')}
              </span>
            )}
            {sectionBadge === 'new' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                {t('common.masterCard.new')}
              </span>
            )}
            {isPremium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3CD] px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                <Crown className="h-3.5 w-3.5" />
                {t('common.masterCard.premium')}
              </span>
            )}
            {isVip && !isPremium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-violet-500">
                <Star className="h-3.5 w-3.5" />
                {t('common.masterCard.vip')}
              </span>
            )}
          </div>
        </div>

        {/* Service tags — only first 2 services */}
        {serviceTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {serviceTags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom bar: Location left, Contact right — separated by line. Button hidden for masters. */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-white/10 pt-2">
          {city && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{city}</span>
            </div>
          )}
          {role !== 'MASTER' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAuthed && role === 'CLIENT') {
                  nav(`/masters/${master.slug ?? master.id}`);
                } else {
                  nav(`/register?redirect=${encodeURIComponent(`/masters/${master.slug ?? master.id}`)}`);
                }
              }}
              className="ml-auto shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm bg-[#343A40] text-white hover:bg-[#2a2e33] dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400 dark:shadow-none"
            >
              {t('common.masterCard.contact')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
