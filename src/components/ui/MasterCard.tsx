import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star,
  MapPin,
  ShieldCheck,
  Briefcase,
  Crown,
  TrendingUp,
  TrendingDown,
  Sparkles,
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

const CARD_ACCENT = '#E97525';
const CARD_ACCENT_LIGHT = '#f08a3d';

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

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthed && role === 'CLIENT') {
      nav(`/masters/${master.slug ?? master.id}`);
    } else {
      nav(`/register?redirect=${encodeURIComponent(`/masters/${master.slug ?? master.id}`)}`);
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
        <div
          className="relative h-20 w-20 overflow-hidden rounded-full border-4 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${CARD_ACCENT}, ${CARD_ACCENT_LIGHT})`,
            borderColor: 'var(--card-border)',
            boxShadow: `0 4px 20px rgba(233,117,37,0.5)`,
          }}
        >
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
        'group relative w-full rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'bg-white dark:bg-white/[0.06]',
        'shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-lg dark:shadow-black/20',
        'hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] sm:hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:hover:shadow-xl dark:hover:shadow-black/30',
      )}
    >
      {/* Top colored band */}
      <div
        className="relative h-12 sm:h-14 md:h-16"
        style={{
          background: 'var(--card-accent-band)',
        }}
      >
        {/* Accent strip at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${CARD_ACCENT}, ${CARD_ACCENT_LIGHT}, ${CARD_ACCENT})`,
          }}
        />

        {/* Promotion discount badge — top-right of band */}
        {activePromotionDiscount !== null && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/15 dark:bg-red-400/20 text-red-600 dark:text-red-400 border border-red-500/25 dark:border-red-400/30 text-[9px] sm:text-[10px] font-medium">
              <TrendingDown className="w-2 h-2 shrink-0" />
              {activePromotionDiscount}%
            </span>
          </div>
        )}

        {/* Avatar */}
        <div
          className="absolute -bottom-6 sm:-bottom-7 md:-bottom-8 left-4 sm:left-5 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden border-2 sm:border-[3px]"
          style={{
            background: `linear-gradient(135deg, ${CARD_ACCENT}, ${CARD_ACCENT_LIGHT})`,
            borderColor: 'var(--card-border)',
            boxShadow: '0 4px 16px rgba(233,117,37,0.5)',
          }}
        >
          {avatarSrc ? (
            <LazyImage
              src={avatarSrc}
              alt={displayName}
              objectFit="cover"
              skeletonHeight={56}
              skeletonWidth={56}
              className="h-full w-full"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <AvatarPlaceholder role="master" height={56} variant={placeholderVariant} />
          )}
        </div>

        {/* Online indicator */}
        {master?.isOnline === true && (
          <div
            className="absolute bottom-3.5 sm:bottom-4 md:bottom-5 left-[2.75rem] sm:left-[3.25rem] md:left-[3.75rem] w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 rounded-full border-2 z-10"
            style={{ borderColor: 'var(--card-border)' }}
            title={t('masters.availableNow')}
          />
        )}

        {/* Rating pill — bottom-right of band */}
        {typeof rating === 'number' && (
          <div
            className="absolute bottom-1.5 right-2 sm:bottom-2.5 sm:right-3 flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
            style={{
              background: 'var(--card-rating-bg)',
              border: '1px solid var(--card-rating-border)',
            }}
          >
            <Star size={10} className="sm:w-[11px] sm:h-[11px] text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-[12px] text-foreground">
              {rating.toFixed(1)}
            </span>
            {totalReviews > 0 && (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">
                ({totalReviews})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pt-8 sm:pt-9 md:pt-10 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 flex flex-col gap-2 sm:gap-3">
        {/* Name row + badges */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className="truncate text-sm sm:text-base"
                style={{
                  fontWeight: 600,
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2,
                  color: 'var(--foreground)',
                }}
              >
                {displayName}
              </span>
              {isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex shrink-0">
                        <ShieldCheck size={14} className="sm:w-4 sm:h-4 text-emerald-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className={badgeTooltipClass}>
                      {t('masters.verified')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Badges — right side, stacked vertically */}
            <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
              {isPremium && (
                <div className="flex items-center gap-0.5">
                  <Crown size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#0d9488' }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#0d9488' }}>
                    {t('common.masterCard.premium')}
                  </span>
                </div>
              )}
              {isVip && !isPremium && (
                <div className="flex items-center gap-0.5">
                  <Crown size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#8b5cf6' }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#8b5cf6' }}>
                    {t('common.masterCard.vip')}
                  </span>
                </div>
              )}
              {sectionBadge === 'popular' && (
                <div className="flex items-center gap-0.5">
                  <TrendingUp size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#f59e0b' }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#f59e0b' }}>
                    {t('common.masterCard.top')}
                  </span>
                </div>
              )}
              {sectionBadge === 'new' && (
                <div className="flex items-center gap-0.5">
                  <Sparkles size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#a78bfa' }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#a78bfa' }}>
                    {t('common.masterCard.new')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category pill */}
          {categoryName && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg self-start"
              style={{
                background: 'var(--card-category-bg)',
              }}
            >
              <Briefcase size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-[10px] sm:text-[11px] font-semibold truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--card-category-text)' }}>
                {categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: 'var(--card-divider)' }}
        />

        {/* Tags + City in same row */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {serviceTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium truncate max-w-[80px] sm:max-w-[100px]"
              style={{
                background: 'var(--card-tag-bg)',
                color: CARD_ACCENT,
                border: '1px solid rgba(233,117,37,0.25)',
              }}
            >
              {tag}
            </span>
          ))}

          {serviceTags.length > 0 && city && (
            <div
              className="w-px self-stretch mx-0.5 sm:mx-1 shrink-0"
              style={{ background: 'var(--card-divider)' }}
            />
          )}

          {city && (
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <MapPin size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: CARD_ACCENT }} />
              <span className="text-[10px] sm:text-[11px] font-medium truncate" style={{ color: 'var(--card-city-text)' }}>
                {city}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        {role !== 'MASTER' && (
          <>
            <div
              className="h-px"
              style={{ background: 'var(--card-divider)' }}
            />

            {/* Contact button — compact, original colors */}
            <button
              onClick={handleContactClick}
              className="w-full h-8 sm:h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] text-white font-medium text-[11px] sm:text-[12px] hover:opacity-90"
              style={{
                background: 'var(--card-button-bg)',
                boxShadow: 'var(--card-button-shadow)',
              }}
            >
              <Phone size={12} strokeWidth={2} />
              {t('common.masterCard.contact')}
            </button>
          </>
        )}
      </div>
    </div>
  );
});
