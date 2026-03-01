import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecommendationsRecentlyViewedQuery } from '@/features/recommendations/recommendationsApi';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { mediaUrl } from '@/utils/media';
import type { RecommendedMasterDto } from '@/types';

const AVATAR_SIZE = 40;

interface RecentlyViewedProps {
  limit?: number;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ limit = 8 }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useRecommendationsRecentlyViewedQuery({ limit });

  const masters = useMemo<RecommendedMasterDto[]>(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  if (!isLoading && masters.length === 0) return null;

  const slugOrId = (m: RecommendedMasterDto) => m.slug || m.id;
  const displayName = (m: RecommendedMasterDto) =>
    `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim() ||
    t('common.masterCard.masterNameFallback');
  const tooltipText = (m: RecommendedMasterDto) =>
    [displayName(m), m.category?.name].filter(Boolean).join(' · ') ||
    displayName(m);

  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-wide text-muted-foreground">
          {t('home.recentlyViewed')}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-10 w-10 shrink-0 rounded-full"
            />
          ))}
        </div>
      ) : (
        <div className="flex max-w-full justify-center gap-2 overflow-x-auto px-1 py-0.5">
          {masters.slice(0, limit).map((m) => {
            const src = mediaUrl(m.avatarUrl || m.avatarFile?.path || null);
            const firstName =
              m.user?.firstName || displayName(m).split(' ')[0] || '?';
            return (
              <TooltipProvider key={m.id} delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        slugOrId(m) && navigate(`/masters/${slugOrId(m)}`)
                      }
                      className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-card bg-transparent p-0 shadow-sm transition-all hover:scale-110 hover:shadow-[0_2px_12px_rgba(13,148,136,0.35)]"
                    >
                      {src ? (
                        <LazyImage
                          src={src}
                          alt={firstName}
                          objectFit="cover"
                          skeletonHeight={AVATAR_SIZE}
                          skeletonWidth={AVATAR_SIZE}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <AvatarPlaceholder
                          role="master"
                          height={AVATAR_SIZE}
                          variant="default"
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {tooltipText(m)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}
    </div>
  );
};
