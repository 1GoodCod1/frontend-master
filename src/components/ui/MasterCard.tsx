import React from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import { OnlineStatusBadge } from '@/components/ui/OnlineStatusBadge';
import { mastersApi } from '@/features/masters/mastersApi';
import { useAppDispatch } from '@/app/hooks';
import { cn } from '@/lib/utils';
import type { PublicMaster } from '@/types';

function StarRating({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const decimal = value % 1;

  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
            />
          );
        }
        if (i === fullStars && decimal > 0) {
          const pct = decimal * 100;
          return (
            <span key={i} className="relative inline-block h-3.5 w-3.5">
              <Star className="absolute inset-0 h-3.5 w-3.5 text-muted-foreground/30 dark:text-muted-foreground/40" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
              </span>
            </span>
          );
        }
        return (
          <Star
            key={i}
            className="h-3.5 w-3.5 text-muted-foreground/30 dark:text-muted-foreground/40"
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
  compact = false,
  onlyAvatar = false,
  reasons,
  sectionBadge,
  promotionDiscount: promotionDiscountProp,
}: MasterCardProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const masterId = master.slug ?? master.id;

  const handleMouseEnter = () => {
    if (masterId) {
      dispatch(
        mastersApi.util.prefetch('mastersById', { id: masterId }, { force: false })
      );
    }
  };

  const firstName =
    master?.user?.firstName ||
    master?.displayName?.split(' ')[0] ||
    master?.name?.split(' ')[0] ||
    t('common.masterCard.masterNameFallback');
  const city = getTranslatedCityName(t, master?.city) || master?.city?.name;
  const rating = master?.rating ?? master?.avgRating;
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
    rawTariff !== 'BASIC' && !!expMs && expMs > Date.now();
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

  const badgeStyles = {
    popular: 'bg-amber-600 text-white dark:bg-amber-500',
    new: 'bg-primary text-primary-foreground',
    vip: 'bg-violet-600 text-white dark:bg-violet-500',
    premium: 'bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950',
  };

  const badgeTooltipClass =
    'rounded-md px-2 py-1 text-xs bg-[hsl(var(--popover))] text-popover-foreground border-0 shadow-sm dark:shadow-black/40';

  const cornerIconBox = (
    icon: React.ReactNode,
    bgClass: string,
    title: string
  ) => (
    <TooltipProvider key={title}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              bgClass
            )}
          >
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className={badgeTooltipClass}>
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card
      className={cn(
        'h-full overflow-hidden border-0 bg-card shadow-lg shadow-amber-900/10 dark:bg-white/[0.06] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/15 dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.45)] cursor-pointer',
        compact && 'min-h-[239px]'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => nav(`/masters/${master.slug ?? master.id}`)}
        onMouseEnter={handleMouseEnter}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nav(`/masters/${master.slug ?? master.id}`);
          }
        }}
        className="relative flex h-full flex-col p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
      >
        {/* Corner badges */}
        <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5">
          {activePromotionDiscount !== null &&
            cornerIconBox(
              <div className="flex items-center gap-1 px-1">
                <Flame className="h-4 w-4 fill-white" />
                <span className="text-xs font-bold">-{activePromotionDiscount}%</span>
              </div>,
              'bg-rose-500 text-white w-auto px-2 min-w-[3.5rem]',
              t('home.promotionBadge', 'Акция!')
            )}
          {sectionBadge === 'popular' &&
            cornerIconBox(
              <Flame className="h-5 w-5" />,
              badgeStyles.popular,
              t('common.masterCard.popularTooltip')
            )}
          {sectionBadge === 'new' &&
            cornerIconBox(
              <Sparkles className="h-5 w-5" />,
              badgeStyles.new,
              t('common.masterCard.newTooltip')
            )}
          {isVip &&
            cornerIconBox(
              <Star className="h-5 w-5" />,
              badgeStyles.vip,
              t('common.masterCard.vipTooltip')
            )}
          {isPremium &&
            cornerIconBox(
              <Crown className="h-5 w-5" />,
              badgeStyles.premium,
              t('common.masterCard.premiumTooltip')
            )}
        </div>

        {/* Avatar with online ring */}
        <div className="relative z-[1] mb-2 flex justify-center">
          <OnlineStatusBadge
            isOnline={master?.isOnline === true}
            lastActivityAt={master?.lastActivityAt}
            variant="ring"
          >
            <div
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white shadow-md dark:border-white/20 dark:shadow-black/50'
              )}
            >
              {avatarSrc ? (
                <LazyImage
                  src={avatarSrc}
                  alt={firstName}
                  objectFit="cover"
                  skeletonHeight={80}
                  skeletonWidth={80}
                  className="h-full w-full shrink-0"
                  style={{ borderRadius: '50%' }}
                />
              ) : (
                <div className="h-full w-full">
                  <AvatarPlaceholder
                    role="master"
                    height={80}
                    variant={placeholderVariant}
                  />
                </div>
              )}
            </div>
          </OnlineStatusBadge>
        </div>

        {onlyAvatar ? null : (
          <CardContent className="flex flex-1 flex-col items-center p-0">
            <div
              className={cn(
                'flex w-full flex-col items-center',
                compact ? 'gap-1' : 'gap-2'
              )}
            >
              <div className="flex flex-wrap items-center justify-center gap-1">
                <span
                  className={cn(
                    'font-semibold text-foreground',
                    compact ? 'text-base' : 'text-lg leading-tight'
                  )}
                >
                  {firstName}
                </span>
                {isVerified && (
                  <span title={t('masters.verified')}>
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </span>
                )}
              </div>

              {categoryName && (
                <p className="text-sm font-normal text-violet-600 dark:text-violet-400">
                  {categoryName}
                </p>
              )}

              {typeof rating === 'number' && (
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRating value={rating} />
                  <span className="text-sm font-normal text-foreground">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}

              {city && (
                <div className="mt-1 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{city}</span>
                </div>
              )}

              {!compact && master?.description && (
                <p className="mt-2 line-clamp-3 text-center text-sm leading-relaxed text-muted-foreground">
                  {String(master.description).slice(0, 120)}...
                </p>
              )}

              {compact && reasons && reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {reasons.slice(0, 2).map((reasonKey: string, idx: number) => {
                    const label = /^[a-z_]+$/.test(reasonKey)
                      ? t(`home.recommendationReasons.${reasonKey}`)
                      : reasonKey;
                    return (
                      <Badge
                        key={idx}
                        variant="default"
                        className="h-6 gap-1 px-1.5 text-[0.7rem]"
                      >
                        <Star className="h-3.5 w-3.5" />
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
});
