import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Award,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { surfaceCardCls, surfaceCardRingCls } from '@/lib/surfaceCard';
import { AVAILABILITY_STATUS } from '@/constants/availabilityStatus';

interface MasterProfileHeroProps {
  title: string;
  avatarUrl?: string | null;
  categoryName?: string | null;
  cityName?: string | null;
  rating?: number | null;
  isVerified?: boolean;
  isOnline?: boolean;
  lastActivityAt?: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteLoading: boolean;
  favoriteAnimation: boolean;
  isClient: boolean;
  isOwnProfile?: boolean;
  hasActiveLead?: boolean;
  availabilityStatus?: string;
  isMasterAvailable?: boolean;
  currentActiveLeads?: number;
  maxActiveLeads?: number;
  experienceYears?: number;
  reviewsCount?: number;
  completedProjects?: number;
  responseRate?: number;
}

// Unified card style — matches homepage / masters / jobs pages
const baseCardCls = surfaceCardCls;

export const MasterProfileHero = ({
  title,
  avatarUrl,
  categoryName: _categoryName,
  cityName: _cityName,
  rating,
  isVerified = false,
  isOnline,
  lastActivityAt,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  favoriteAnimation,
  isClient,
  isOwnProfile: _isOwnProfile = false,
  hasActiveLead: _hasActiveLead = false,
  availabilityStatus = 'AVAILABLE',
  isMasterAvailable = true,
  currentActiveLeads = 0,
  maxActiveLeads = 5,
  experienceYears,
  reviewsCount = 0,
  completedProjects = 0,
  responseRate = 100,
}: MasterProfileHeroProps) => {
  const { t } = useTranslation();
  const avatarSrc = mediaUrl(avatarUrl);

  const showUnavailable =
    !isMasterAvailable || availabilityStatus !== AVAILABILITY_STATUS.AVAILABLE;
  const unavailableLabel =
    availabilityStatus === AVAILABILITY_STATUS.BUSY
      ? t('masterDetails.masterIsBusy', 'Busy')
      : availabilityStatus === AVAILABILITY_STATUS.OFFLINE
        ? t('masterDetails.masterIsOffline', 'Offline')
        : t('masterDetails.leadsLimitReached', 'Full');
  const unavailableTooltip =
    availabilityStatus === AVAILABILITY_STATUS.AVAILABLE
      ? t('masterDetails.leadsLimitDescription', { currentActiveLeads, maxActiveLeads })
      : t('masterDetails.unavailableDescription', 'Subscribe to be notified when available.');

  const ratingDisplay = typeof rating === 'number' ? rating.toFixed(1) : '0.0';

  // Stats — same data, redesigned with Lucide icons and muted accent colors
  const stats = [
    {
      Icon: CheckCircle2,
      value: String(completedProjects),
      label: t('masterDetails.statsCompletedProjects', 'Completed projects'),
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      Icon: Award,
      value:
        experienceYears != null
          ? `${experienceYears} ${experienceYears === 1 ? t('masterDetails.experienceYear') : t('masterDetails.experienceYears')}`
          : '0',
      label: t('masterDetails.statsExperience', 'Experience'),
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      Icon: Star,
      value: ratingDisplay,
      label: t('masterDetails.statsRating', 'Average rating'),
      iconColor: 'text-yellow-500 dark:text-yellow-400',
    },
    {
      Icon: MessageSquare,
      value: String(reviewsCount),
      label: t('masterDetails.statsReviews', 'Reviews'),
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      Icon: TrendingUp,
      value: `${responseRate}%`,
      label: t('masterDetails.statsResponseRate', 'Response to requests'),
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({ title, url: window.location.href, text: title })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {});
    }
  };

  return (
    <TooltipProvider>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Back link — sits above the card, muted */}
        <RouterLink
          to="/masters"
          className="inline-flex items-center gap-1.5 text-sm mb-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{t('masterDetails.backToMasters', 'Back to Masters')}</span>
        </RouterLink>

        {/* Main profile card */}
        <div className={cn(baseCardCls, 'rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8')}>
          <div className="flex flex-col md:flex-row items-start gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex items-center justify-center',
                  'bg-gray-100 dark:bg-white/[0.04]',
                  'border border-gray-200/80 dark:border-white/[0.08]',
                )}
              >
                {avatarSrc ? (
                  <LazyImage
                    src={avatarSrc}
                    alt={title}
                    objectFit="cover"
                    skeletonHeight={112}
                    skeletonWidth={112}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <AvatarPlaceholder role="master" height={112} variant="default" />
                )}
              </div>
              {/* Online dot */}
              {isOnline && (
                <span className={cn('absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2', surfaceCardRingCls)} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
              {/* Name + verified */}
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {title}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold">
                    <ShieldCheck size={12} />
                    {t('masters.verified', 'Verified')}
                  </span>
                )}
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-2 mb-2.5 text-slate-700 dark:text-slate-300">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const r = rating ?? 0;
                    const isFull = r >= s;
                    const isHalf = r >= s - 0.5 && r < s;
                    return (
                      <div key={s} className="relative shrink-0">
                        {!isFull && !isHalf && (
                          <Star
                            size={16}
                            strokeWidth={1.5}
                            className="text-slate-300 dark:text-slate-600 fill-transparent"
                          />
                        )}
                        {isFull && (
                          <Star
                            size={16}
                            strokeWidth={1.5}
                            className="fill-yellow-400 text-yellow-400 dark:fill-yellow-400 dark:text-yellow-400"
                          />
                        )}
                        {isHalf && (
                          <>
                            <Star
                              size={16}
                              strokeWidth={1.5}
                              className="text-slate-300 dark:text-slate-600 fill-transparent"
                            />
                            <div className="absolute inset-0 w-1/2 overflow-hidden">
                              <Star
                                size={16}
                                strokeWidth={1.5}
                                className="fill-yellow-400 text-yellow-400"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {ratingDisplay}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ 5</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ·{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {reviewsCount}
                  </span>{' '}
                  {t('masterDetails.reviewsCountLabel', 'reviews')}
                </span>
              </div>

              {/* Status pill */}
              {(isOnline || lastActivityAt) && (
                <div className="mb-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border',
                      isOnline
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/[0.06]',
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500',
                      )}
                    />
                    {isOnline
                      ? t('master.status.online', 'Online')
                      : lastActivityAt
                        ? t('master.status.recentlyActive', 'Recently active')
                        : t('master.status.offline', 'Offline')}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2.5">
                {isClient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleFavorite}
                    disabled={favoriteLoading}
                    className={cn(
                      'h-9 px-4 rounded-full inline-flex items-center gap-1.5 transition font-medium text-sm',
                      isFavorite
                        ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300'
                        : 'bg-transparent border-gray-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:bg-gray-200/70 hover:text-slate-900 hover:border-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100 dark:hover:border-white/20',
                    )}
                    style={favoriteAnimation ? { animation: 'heartPop 0.5s ease' } : undefined}
                  >
                    <Heart
                      size={14}
                      className={cn(isFavorite && 'fill-current')}
                    />
                    {isFavorite
                      ? t('masterDetails.saved', 'Saved')
                      : t('masterDetails.save', 'Save')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-9 px-4 rounded-full inline-flex items-center gap-1.5 transition font-medium text-sm bg-transparent border-gray-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:bg-gray-200/70 hover:text-slate-900 hover:border-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100 dark:hover:border-white/20"
                >
                  <Share2 size={14} />
                  {t('masterDetails.share', 'Share')}
                </Button>
              </div>
            </div>

            {/* Unavailable badge */}
            {showUnavailable && (
              <div className="md:ml-auto shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-semibold h-7 px-2.5 cursor-default rounded-full',
                        availabilityStatus === 'OFFLINE'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
                      )}
                    >
                      {unavailableLabel}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    {unavailableTooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Stats row — 5 cards below the profile card */}
        <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                baseCardCls,
                'rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.Icon size={18} className={stat.iconColor} strokeWidth={1.75} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight line-clamp-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </TooltipProvider>
  );
};
