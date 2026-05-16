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
              className="relative h-10 w-10 shrink-0 rounded-full bg-[#E97525]/30 p-[2px] transition duration-200 hover:scale-110 hover:bg-[#E97525] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E97525]/50"
            >
              <div className="h-full w-full rounded-full overflow-hidden bg-card">
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
      <div className="overflow-hidden rounded-2xl bg-[#F9FAFB] border border-gray-200/80 shadow-sm dark:bg-white/[0.06] dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E97525]/10 text-[#E97525]">
            <Eye className="h-4 w-4" />
          </span>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground leading-tight">
            {title ?? t('home.recentlyViewed')}
          </h3>
        </div>

        {/* List */}
        {isLoading ? (
          <ul className="pb-1.5">
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
          <ul className="pb-1.5">
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
                    className="group w-full flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06] focus:outline-none focus-visible:bg-black/[0.03] dark:focus-visible:bg-white/[0.06]"
                  >
                    <div
                      className="h-8 w-8 shrink-0 rounded-full overflow-hidden transition"
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
    <div className="rounded-2xl bg-card px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E97525]/10 text-[#E97525]">
          <Eye className="h-4 w-4" />
        </span>
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
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-10 shrink-0 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {masters.slice(0, limit).map(renderAvatar)}
        </div>
      )}
    </div>
  );
};
