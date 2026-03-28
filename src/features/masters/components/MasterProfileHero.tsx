import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Clock,
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

export const MasterProfileHero = ({
  title,
  avatarUrl,
  categoryName: _categoryName,
  cityName: _cityName,
  rating,
  isVerified: _isVerified,
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

  const showUnavailable = !isMasterAvailable || availabilityStatus !== AVAILABILITY_STATUS.AVAILABLE;
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

  const stats = [
    { value: String(completedProjects), label: t('masterDetails.statsCompletedProjects', 'Completed projects'), icon: '✅' },
    { value: experienceYears != null ? `${experienceYears} ${experienceYears === 1 ? t('masterDetails.experienceYear') : t('masterDetails.experienceYears')}` : '0', label: t('masterDetails.statsExperience', 'Experience'), icon: '🏆' },
    { value: ratingDisplay, label: t('masterDetails.statsRating', 'Average rating'), icon: '⭐' },
    { value: String(reviewsCount), label: t('masterDetails.statsReviews', 'Reviews'), icon: '💬' },
    { value: `${responseRate}%`, label: t('masterDetails.statsResponseRate', 'Response to requests'), icon: '📊' },
  ];

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
        text: title,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {});
    }
  };

  return (
    <TooltipProvider>
      {/* Hero Banner — gradient like Figma */}
      <div className="relative bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6 sm:pt-5 sm:pb-8 relative">
          <RouterLink
            to="/masters"
            className="inline-flex items-center gap-1.5 text-white hover:text-white/90 mb-4 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t('masterDetails.backToMasters', 'Back to Masters')}</span>
          </RouterLink>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-800 dark:bg-gray-900 flex items-center justify-center shadow-xl border-4 border-white/30">
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
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
              </div>
              {(isOnline || lastActivityAt) && (
                <div className="flex flex-wrap items-center gap-1.5 text-sm mb-3">
                  <span
                    className={cn(
                      'flex items-center gap-1.5 font-medium',
                      isOnline
                        ? 'text-green-300 dark:text-green-400'
                        : lastActivityAt
                          ? 'text-amber-200 dark:text-amber-300'
                          : 'text-white/80'
                    )}
                  >
                    <Clock size={14} />
                    {isOnline
                      ? t('master.status.online', 'Online')
                      : lastActivityAt
                        ? t('master.status.recentlyActive', 'Recently active')
                        : t('master.status.offline', 'Offline')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const r = rating ?? 0;
                    const isFull = r >= s;
                    const isHalf = r >= s - 0.5 && r < s;
                    const isEmpty = !isFull && !isHalf;
                    return (
                      <div key={s} className="relative shrink-0">
                        {isEmpty && (
                          <Star size={18} strokeWidth={1.5} className="text-white/40 stroke-white fill-transparent" />
                        )}
                        {isFull && (
                          <Star size={18} strokeWidth={1.5} className="fill-amber-200 text-amber-200 stroke-amber-300" />
                        )}
                        {isHalf && (
                          <>
                            <Star size={18} strokeWidth={1.5} className="text-white/40 stroke-white fill-transparent" />
                            <div className="absolute inset-0 w-1/2 overflow-hidden">
                              <Star size={18} strokeWidth={1.5} className="fill-amber-200 text-amber-200 stroke-amber-300" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="font-semibold">{ratingDisplay}</span>
                <span className="text-sm opacity-90">/ 5</span>
                <span className="text-sm">
                  (<span className="font-bold text-amber-200">{reviewsCount}</span>{' '}
                  {t('masterDetails.reviewsCountLabel', 'reviews')})
                </span>
              </div>

              {/* Actions — Figma: white bg, thin light grey border, light orange icon/text */}
              <div className="flex flex-wrap gap-3 mt-4">
                {isClient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleFavorite}
                    disabled={favoriteLoading}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border transition-all',
                      isFavorite
                        ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 dark:bg-red-500 dark:border-red-500 dark:text-white dark:hover:bg-red-600 dark:hover:border-red-600'
                        : 'border-gray-200 dark:border-white/40 bg-white dark:bg-white/25 text-amber-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/35'
                    )}
                    style={favoriteAnimation ? { animation: 'heartPop 0.5s ease' } : undefined}
                  >
                    <Heart size={16} className={cn(isFavorite && 'fill-current')} />
                    <span className="font-medium">{isFavorite ? t('masterDetails.saved', 'Saved') : t('masterDetails.save', 'Save')}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/40 bg-white dark:bg-white/25 text-amber-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/35"
                >
                  <Share2 size={16} />
                  <span className="font-medium">{t('masterDetails.share', 'Share')}</span>
                </Button>
              </div>
            </div>

            {/* Unavailable badge */}
            {showUnavailable && (
              <div className="md:ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-semibold h-6 cursor-default border-white/40 bg-white/10 text-white',
                        availabilityStatus === 'OFFLINE' && 'bg-red-500/30 border-red-400/50'
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

          {/* Stats bar — Figma: translucent white bg, faint white border, dark grey text */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/20 dark:bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30 dark:border-white/20"
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-gray-900 dark:text-white font-bold text-lg leading-none">{stat.value}</div>
                <div className="text-gray-700 dark:text-amber-100 text-xs mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
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
