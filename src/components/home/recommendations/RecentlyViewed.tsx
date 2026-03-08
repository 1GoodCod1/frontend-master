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

const AVATAR_SIZE = 36;
const ACCENT = '#E97525';

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
    <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}10)`,
            border: `1px solid ${ACCENT}40`,
          }}
        >
          <Eye className="h-4 w-4" style={{ color: ACCENT }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('home.recentlyViewed')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('home.recentlyViewedSubtitle')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-9 w-9 shrink-0 rounded-full"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1">
          {masters.slice(0, limit).map((m) => {
            const src = mediaUrl(m.avatarUrl || m.avatarFile?.path || null);
            return (
              <TooltipProvider key={m.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        slugOrId(m) && navigate(`/masters/${slugOrId(m)}`)
                      }
                      className="relative h-9 w-9 shrink-0 rounded-full p-[2.5px] transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_16px_rgba(233,117,37,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT}, #f08a3d)`,
                        boxShadow: '0 2px 8px rgba(233,117,37,0.25)',
                      }}
                    >
                      <div className="h-full w-full rounded-full overflow-hidden bg-card border-2 border-background dark:border-[#1a1a1a]">
                        {src ? (
                          <LazyImage
                            src={src}
                            alt={displayName(m)}
                            objectFit="cover"
                            skeletonHeight={AVATAR_SIZE}
                            skeletonWidth={AVATAR_SIZE}
                            className="h-full w-full"
                            style={{ borderRadius: '9999px' }}
                          />
                        ) : (
                          <AvatarPlaceholder
                            role="master"
                            height={AVATAR_SIZE}
                            variant="default"
                          />
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="rounded-lg px-3 py-2 text-sm"
                  >
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
