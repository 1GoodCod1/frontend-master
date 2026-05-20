import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star,
  MapPin,
  ShieldCheck,
  Briefcase,
  TrendingDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import { mastersApi } from '@/features/masters/mastersApi';
import { useAppDispatch } from '@/app/hooks';
import { cn } from '@/lib/utils';
import { surfaceCardInteractiveCls, surfaceCardRingCls } from '@/lib/surfaceCard';
import { ACCENT, ACCENT_LIGHT } from '@/constants/theme';
import { useMasterCardData } from './masterCard/useMasterCardData';
import { MasterCardBadges } from './masterCard/MasterCardBadges';
import type { PublicMaster } from '@/types';

type MasterCardProps = {
  master: PublicMaster;
  compact?: boolean;
  onlyAvatar?: boolean;
  reasons?: string[];
  sectionBadge?: 'popular' | 'new';
  promotionDiscount?: number;
};

const CARD_ACCENT = ACCENT;
const CARD_ACCENT_LIGHT = ACCENT_LIGHT;

const badgeTooltipClass =
  'rounded-md px-2 py-1 text-xs bg-[hsl(var(--popover))] text-popover-foreground border-0 shadow-sm dark:shadow-black/40';

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
  const masterId = master.slug ?? master.id;

  const {
    displayName, city, rating, totalReviews, categoryName,
    avatarSrc, isPlus, isPro, placeholderVariant,
    isVerified, activePromotionDiscount, serviceTags,
  } = useMasterCardData(master, promotionDiscountProp);

  const handleMouseEnter = () => {
    if (masterId) {
      dispatch(mastersApi.util.prefetch('mastersById', { id: masterId }, { force: false }));
    }
  };

  const navigateToMaster = () => nav(`/masters/${master.slug ?? master.id}`);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToMaster();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToMaster();
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
            <LazyImage src={avatarSrc} alt={displayName} objectFit="cover" skeletonHeight={80} skeletonWidth={80} className="h-full w-full" style={{ borderRadius: '50%' }} />
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
        'group relative w-full h-full flex flex-col rounded-2xl overflow-hidden cursor-pointer',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        surfaceCardInteractiveCls,
      )}
    >
      {/* Header with avatar + info */}
      <div className="flex items-start gap-1.5 min-[480px]:gap-2 sm:gap-3 p-2 min-[480px]:p-3 sm:p-4 pb-1.5 min-[480px]:pb-2 sm:pb-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-8 h-8 min-[480px]:w-10 min-[480px]:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl overflow-hidden"
            style={avatarSrc ? {
              background: `linear-gradient(135deg, ${CARD_ACCENT}, ${CARD_ACCENT_LIGHT})`,
              boxShadow: '0 4px 12px rgba(233,117,37,0.25)',
            } : undefined}
          >
            {avatarSrc ? (
              <LazyImage src={avatarSrc} alt={displayName} objectFit="cover" skeletonHeight={56} skeletonWidth={56} className="h-full w-full" />
            ) : (
              <AvatarPlaceholder role="master" height={40} fillParent variant={placeholderVariant} />
            )}
          </div>
          {master?.isOnline === true && (
            <div
              className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 z-10', surfaceCardRingCls)}
              title={t('masters.availableNow')}
            />
          )}
        </div>

        {/* Name + Category + Badges */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[11px] min-[480px]:text-[13px] sm:text-sm font-semibold text-foreground leading-tight">
                  {displayName}
                </span>
                {isVerified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex shrink-0"><ShieldCheck size={13} className="text-emerald-500" /></span>
                      </TooltipTrigger>
                      <TooltipContent className={badgeTooltipClass}>{t('masters.verified')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {categoryName && (
                <div className="flex items-center gap-1 mt-1">
                  <Briefcase size={9} className="shrink-0 text-muted-foreground/60 min-[480px]:[width:10px] min-[480px]:[height:10px]" />
                  <span className="text-[9px] min-[480px]:text-[10px] sm:text-[11px] text-muted-foreground truncate">
                    {categoryName}
                  </span>
                </div>
              )}
            </div>
            <MasterCardBadges
              isPlus={isPlus}
              isPro={isPro}
              sectionBadge={sectionBadge === 'new' ? 'new' : undefined}
              showTopBadge={master.topMaster === true}
            />
          </div>
        </div>
      </div>

      {/* Rating + Discount row */}
      {(typeof rating === 'number' || activePromotionDiscount !== null) && (
        <div className="flex items-center gap-1 min-[480px]:gap-1.5 sm:gap-2 px-2 min-[480px]:px-3 sm:px-4 pb-1.5 min-[480px]:pb-2 sm:pb-2.5">
          {typeof rating === 'number' && (
            <div className="flex items-center gap-0.5 min-[480px]:gap-1 px-1.5 min-[480px]:px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
              <Star size={9} className="text-amber-500 fill-amber-500 shrink-0 min-[480px]:[width:11px] min-[480px]:[height:11px]" />
              <span className="font-semibold text-[10px] min-[480px]:text-[11px] text-amber-700 dark:text-amber-400">{rating.toFixed(1)}</span>
              {totalReviews > 0 && (
                <span className="text-[9px] min-[480px]:text-[10px] text-amber-600/60 dark:text-amber-400/50">({totalReviews})</span>
              )}
            </div>
          )}
          {activePromotionDiscount !== null && (
            <span className="inline-flex items-center gap-0.5 px-1.5 min-[480px]:px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] min-[480px]:text-[10px] font-semibold">
              <TrendingDown className="w-2.5 h-2.5 shrink-0" />
              -{activePromotionDiscount}%
            </span>
          )}
        </div>
      )}

      {/* Service tags */}
      {serviceTags.length > 0 && (
        <div className="px-2 min-[480px]:px-3 sm:px-4 pb-1 min-[480px]:pb-1.5 sm:pb-2">
          <div className="flex items-center gap-0.5 min-[480px]:gap-1 sm:gap-1.5 flex-wrap">
            {serviceTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-1 min-[480px]:px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] min-[480px]:text-[9px] sm:text-[10px] font-medium truncate max-w-[42%] min-[480px]:max-w-[45%] sm:max-w-[100px] bg-orange-50 dark:bg-orange-500/8 text-orange-700 dark:text-orange-400/90 border border-orange-200/60 dark:border-orange-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {city ? (
        <div className="mt-auto px-2 min-[480px]:px-3 sm:px-4 pb-2 min-[480px]:pb-3 sm:pb-4 pt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-muted-foreground/80 min-w-0">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{city}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
});
