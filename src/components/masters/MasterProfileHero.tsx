import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Send,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { OnlineStatusBadge } from '@/components/ui/OnlineStatusBadge';
import { mediaUrl } from '@/utils/media';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
  /** When true, the viewer is the master themselves — hide "Leave request" */
  isOwnProfile?: boolean;
  /** When true, client already has an active lead to this master — hide "Leave request" */
  hasActiveLead?: boolean;
  availabilityStatus?: string;
  isMasterAvailable?: boolean;
  currentActiveLeads?: number;
  maxActiveLeads?: number;
}

export const MasterProfileHero = ({
  title,
  avatarUrl,
  categoryName,
  cityName,
  rating,
  isVerified,
  isOnline,
  lastActivityAt,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  favoriteAnimation,
  isClient,
  isOwnProfile = false,
  hasActiveLead = false,
  availabilityStatus = 'AVAILABLE',
  isMasterAvailable = true,
  currentActiveLeads = 0,
  maxActiveLeads = 5,
}: MasterProfileHeroProps) => {
  const { t } = useTranslation();
  const avatarSrc = mediaUrl(avatarUrl);

  const showUnavailable = !isMasterAvailable || availabilityStatus !== 'AVAILABLE';
  const unavailableLabel =
    availabilityStatus === 'BUSY'
      ? t('masterDetails.masterIsBusy', 'Busy')
      : availabilityStatus === 'OFFLINE'
        ? t('masterDetails.masterIsOffline', 'Offline')
        : t('masterDetails.leadsLimitReached', 'Full');
  const unavailableTooltip =
    availabilityStatus === 'AVAILABLE'
      ? t('masterDetails.leadsLimitDescription', { currentActiveLeads, maxActiveLeads })
      : t('masterDetails.unavailableDescription', 'Subscribe to be notified when available.');

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] mb-6 shadow-xl shadow-amber-900/20 dark:shadow-black/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80 rounded-t-lg" />

        <div className="absolute top-3 right-4 md:right-6 z-10 flex flex-col items-end gap-1">
          {(isOnline || lastActivityAt) && (
            <OnlineStatusBadge
              isOnline={isOnline}
              lastActivityAt={lastActivityAt}
              variant="text"
              size="medium"
              showLabel={true}
            />
          )}
          {showUnavailable && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-semibold h-6 cursor-default',
                    availabilityStatus === 'OFFLINE'
                      ? 'border-destructive/50 bg-destructive/10 text-destructive'
                      : 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {unavailableLabel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left">{unavailableTooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <CardContent className="pt-4 pb-4 px-4 sm:pt-6 sm:pb-6 sm:px-6 md:px-8">
          <RouterLink
            to="/masters"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('nav.masters')}
          </RouterLink>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] rounded-full overflow-hidden border-4 border-amber-300/40 dark:border-amber-500/20 shadow-xl shadow-amber-900/10 dark:shadow-black/30">
                {avatarSrc ? (
                  <LazyImage
                    src={avatarSrc}
                    alt={title}
                    objectFit="cover"
                    skeletonHeight={120}
                    skeletonWidth={120}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <AvatarPlaceholder role="master" height={120} variant="default" />
                )}
              </div>
              {(isOnline || lastActivityAt) && (
                <div className="absolute bottom-1 right-1">
                  <OnlineStatusBadge
                    isOnline={isOnline}
                    lastActivityAt={lastActivityAt}
                    variant="dot"
                    size="medium"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {isVerified && (
                  <span title={t('masters.verified')}>
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                  </span>
                )}
              </div>

              {(categoryName || cityName) && (
                <div className="flex flex-wrap gap-3 mt-1 text-muted-foreground justify-center sm:justify-start">
                  {categoryName && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {categoryName}
                    </span>
                  )}
                  {cityName && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cityName}
                    </span>
                  )}
                </div>
              )}

              {typeof rating === 'number' && (
                <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">/ 5</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                {isClient && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 transition-all',
                      isFavorite
                        ? 'border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:border-red-500'
                        : 'border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] hover:bg-amber-100/80 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/40'
                    )}
                    onClick={onToggleFavorite}
                    disabled={favoriteLoading}
                    style={favoriteAnimation ? { animation: 'heartPop 0.5s ease' } : undefined}
                  >
                    <Heart
                      className={cn('h-5 w-5', isFavorite && 'fill-current')}
                    />
                  </Button>
                )}

                {isClient && !isOwnProfile && !hasActiveLead && isVerified && (
                  <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500">
                    <a href="#lead-form">
                      <Send className="h-4 w-4" />
                      {t('masterDetails.leaveRequest', 'Leave request')}
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] border-[#f5f4eb] dark:border-white/10 hover:bg-amber-100/80 dark:hover:bg-amber-500/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40">
                  <RouterLink to="/masters">{t('common.back')}</RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
