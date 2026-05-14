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
import { RECENTLY_VIEWED_AVATAR_SIZE, RECENTLY_VIEWED_ACCENT } from '@/constants';

interface RecentlyViewedProps {
  limit?: number;
  /** Override section title (default: home.recentlyViewed) */
  title?: string;
  /** Override subtitle (default: home.recentlyViewedSubtitle) */
  subtitle?: string;
  /** Layout: 'horizontal' (default, wide banner) or 'sidebar' (narrow column) */
  layout?: 'horizontal' | 'sidebar';
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  limit = 8,
  title,
  subtitle,
  layout = 'horizontal',
}) => {
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

  const renderAvatar = (m: RecommendedMasterDto) => {
    const src = mediaUrl(
      m.avatarUrl || m.avatarFile?.path || m.user?.avatarFile?.path || null,
    );
    return (
      <TooltipProvider key={m.id} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => slugOrId(m) && navigate(`/masters/${slugOrId(m)}`)}
              className="relative h-10 w-10 shrink-0 rounded-full p-[2.5px] transition duration-200 hover:scale-110 hover:shadow-[0_4px_16px_rgba(233,117,37,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: `linear-gradient(135deg, ${RECENTLY_VIEWED_ACCENT}, #f08a3d)`,
                boxShadow: '0 2px 8px rgba(233,117,37,0.25)',
              }}
            >
              <div className="h-full w-full rounded-full overflow-hidden bg-card border-2 border-background dark:border-[#1a1a1a]">
                {src ? (
                  <LazyImage
                    src={src}
                    alt={displayName(m)}
                    objectFit="cover"
                    skeletonHeight={RECENTLY_VIEWED_AVATAR_SIZE}
                    skeletonWidth={RECENTLY_VIEWED_AVATAR_SIZE}
                    className="h-full w-full"
                    style={{ borderRadius: '9999px' }}
                  />
                ) : (
                  <AvatarPlaceholder
                    role="master"
                    height={RECENTLY_VIEWED_AVATAR_SIZE}
                    variant="default"
                  />
                )}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-lg px-3 py-2 text-sm">
            {tooltipText(m)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (layout === 'sidebar') {
    const visible = masters.slice(0, limit);
    return (
      <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200/50 dark:border-white/[0.06]">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            style={{
              background: `linear-gradient(135deg, ${RECENTLY_VIEWED_ACCENT}22, ${RECENTLY_VIEWED_ACCENT}10)`,
              border: `1px solid ${RECENTLY_VIEWED_ACCENT}35`,
            }}
          >
            <Eye className="h-3.5 w-3.5" style={{ color: RECENTLY_VIEWED_ACCENT }} />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground leading-tight truncate">
            {title ?? t('home.recentlyViewed')}
          </h3>
        </div>

        {/* List */}
        {isLoading ? (
          <ul className="divide-y divide-gray-200/50 dark:divide-white/[0.05]">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-gray-200/50 dark:divide-white/[0.05]">
            {visible.map((m) => {
              const src = mediaUrl(
                m.avatarUrl || m.avatarFile?.path || m.user?.avatarFile?.path || null,
              );
              const name = displayName(m);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => slugOrId(m) && navigate(`/masters/${slugOrId(m)}`)}
                    className="group w-full flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-white/[0.03]"
                  >
                    <div
                      className="h-8 w-8 shrink-0 rounded-full overflow-hidden ring-2 transition"
                      style={{
                        boxShadow: `0 0 0 2px ${RECENTLY_VIEWED_ACCENT}40`,
                      }}
                    >
                      {src ? (
                        <LazyImage
                          src={src}
                          alt={name}
                          objectFit="cover"
                          skeletonHeight={32}
                          skeletonWidth={32}
                          className="h-full w-full"
                        />
                      ) : (
                        <AvatarPlaceholder role="master" height={32} variant="default" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12.5px] font-medium text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                        {name}
                      </p>
                      {m.category?.name ? (
                        <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                          {m.category.name}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm px-4 py-4 shadow-sm">
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${RECENTLY_VIEWED_ACCENT}20, ${RECENTLY_VIEWED_ACCENT}10)`,
            border: `1px solid ${RECENTLY_VIEWED_ACCENT}40`,
          }}
        >
          <Eye className="h-4 w-4" style={{ color: RECENTLY_VIEWED_ACCENT }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {title ?? t('home.recentlyViewed')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {subtitle ?? t('home.recentlyViewedSubtitle')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-9 shrink-0 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex justify-center gap-3 overflow-x-auto pb-1 -mx-1">
          {masters.slice(0, limit).map(renderAvatar)}
        </div>
      )}
    </div>
  );
};
