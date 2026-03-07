import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star,
  MapPin,
  BadgeCheck,
  Flame,
  Sparkles,
  Crown,
  TrendingDown,
  Phone,
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
        'group relative w-full rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer',
        'bg-white/95 shadow-md shadow-black/5 dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20',
        'hover:-translate-y-1 hover:shadow-lg hover:shadow-xl hover:shadow-black/8',
        'dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.6)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
    >
      {/* Cover image area */}
      <div className="relative h-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.25),transparent_70%)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_70%)]" />

        {/* Floating badges top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {activePromotionDiscount !== null && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-red-500/15 dark:bg-red-400/20 backdrop-blur-md text-red-600 dark:text-red-400 border border-red-500/25 dark:border-red-400/30 text-[10px] font-medium">
              <TrendingDown className="w-2.5 h-2.5" />
              {activePromotionDiscount}%
            </span>
          )}
          {sectionBadge === 'popular' && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/15 dark:bg-orange-400/20 backdrop-blur-md text-orange-600 dark:text-orange-400 border border-orange-500/25 dark:border-orange-400/30 text-[10px] font-medium">
              <Flame className="w-2.5 h-2.5" />
              {t('common.masterCard.popular')}
            </span>
          )}
          {sectionBadge === 'new' && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-violet-500/15 dark:bg-violet-400/20 backdrop-blur-md text-violet-600 dark:text-violet-400 border border-violet-500/25 dark:border-violet-400/30 text-[10px] font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              {t('common.masterCard.new')}
            </span>
          )}
        </div>

        {(isPremium || isVip) && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 backdrop-blur-md text-amber-700 dark:text-amber-300 border border-amber-500/25 dark:border-amber-400/30 text-[10px] font-medium">
            <Crown className="w-2.5 h-2.5" />
            {isPremium ? t('common.masterCard.premium') : t('common.masterCard.vip')}
          </div>
        )}
      </div>

      {/* Avatar overlapping cover */}
      <div className="relative px-3.5 -mt-8">
        <div className="relative inline-block">
          {/* Gradient border + avatar */}
          <div className="avatar-gradient-border w-14 h-14 rounded-xl p-[2.5px] shadow-lg">
            <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-card">
              {avatarSrc ? (
                <LazyImage
                  src={avatarSrc}
                  alt={displayName}
                  objectFit="cover"
                  skeletonHeight={56}
                  skeletonWidth={56}
                  className="h-full w-full"
                  style={{ borderRadius: '0.75rem' }}
                />
              ) : (
                <AvatarPlaceholder role="master" height={56} variant={placeholderVariant} />
              )}
            </div>
          </div>
          {master?.isOnline === true && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-[#1e1e1e]"
              title={t('masters.availableNow')}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 pt-2 pb-3.5">
        {/* Name + category */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-gray-900 dark:text-white truncate text-[14px]">
                {displayName}
              </h3>
              {isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex shrink-0">
                        <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
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
              <p className="text-gray-400 dark:text-gray-500 mt-0.5 text-[12px]">
                {categoryName}
              </p>
            )}
          </div>

          {/* Rating pill — amber/gold для рейтинга в обеих темах */}
          {typeof rating === 'number' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 dark:bg-amber-400/15 dark:border-amber-400/25">
              <Star className="w-3 h-3 fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400" />
              <span className="text-amber-700 text-[12px] font-medium dark:text-amber-300">
                {rating.toFixed(1)}
              </span>
              {totalReviews > 0 && (
                <span className="text-muted-foreground text-[10px]">
                  ({totalReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {serviceTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/[0.04] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/[0.06] text-[11px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          {city && (
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="text-[12px]">{city}</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--button-bg))] text-white hover:bg-[hsl(var(--button-bg-hover))] transition-all duration-200 active:scale-[0.97] text-[12px] ml-auto"
            >
              <Phone className="w-3 h-3" />
              {t('common.masterCard.contact')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
