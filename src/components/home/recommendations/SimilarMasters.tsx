import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Star, ChevronRight } from 'lucide-react';
import { useRecommendationsSimilarQuery } from '@/features/recommendations/recommendationsApi';
import { MasterCard } from '@/components/ui/MasterCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTranslatedCityName } from '@/utils/translateCityCategory';
import { mediaUrl } from '@/utils/media';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import type { RecommendedMasterDto } from '@/types';

interface SimilarMastersProps {
  masterId: string;
  limit?: number;
  variant?: 'default' | 'sidebar';
}

export const SimilarMasters: React.FC<SimilarMastersProps> = ({
  masterId,
  limit = 4,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useRecommendationsSimilarQuery({
    masterId,
    limit,
  });

  const masters = useMemo<RecommendedMasterDto[]>(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const navigate = useNavigate();

  if (isLoading) {
    const header = (
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {t('masterDetails.similarMasters')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('masterDetails.similarMastersSubtitle')}
          </p>
        </div>
      </div>
    );
    if (variant === 'sidebar') {
      return (
        <div>
          {header}
          <div className="space-y-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="py-6">
        {header}
        <div className="grid grid-cols-12 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="col-span-12 sm:col-span-6 md:col-span-3"
            >
              <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none">
                <Skeleton className="h-[150px] rounded-t-lg" />
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/5" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t('masterDetails.similarMasters')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('masterDetails.similarMastersSubtitle')}
            </p>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          {(!masters || masters.length === 0) ? (
            <p className="text-sm text-muted-foreground py-4">
              {t('masterDetails.similarMastersEmpty')}
            </p>
          ) : masters.map((master) => {
            const slug = master.slug ?? master.id;
            const name = [master?.user?.firstName, master?.user?.lastName].filter(Boolean).join(' ').trim() || master?.displayName || master?.name || t('masterDetails.masterLabel');
            const r = master?.rating ?? master?.avgRating ?? 0;
            const city = master?.city ? getTranslatedCityName(t, master.city) : '';
            const avatarSrc = mediaUrl(master?.avatarUrl ?? master?.avatarFile?.path);
            return (
              <button
                key={master.id}
                type="button"
                onClick={() => navigate(`/masters/${slug}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-amber-50 dark:hover:bg-amber-500/5 hover:border-amber-100 dark:hover:border-amber-500/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {avatarSrc ? (
                    <LazyImage src={avatarSrc} alt={name} objectFit="cover" skeletonHeight={40} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <AvatarPlaceholder name={name} height={40} variant="default" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{r.toFixed(1)} · {city}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className="py-6 md:py-8">
      <div className="-ml-1 mb-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
            <Users className="h-[22px] w-[22px]" />
          </span>
          <h3 className="text-xl font-semibold text-foreground md:text-2xl">
            {t('masterDetails.similarMasters')}
          </h3>
        </div>
        <p className="ml-14 text-muted-foreground">
          {t('masterDetails.similarMastersSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {(!masters || masters.length === 0) ? (
          <p className="col-span-12 text-muted-foreground py-6">
            {t('masterDetails.similarMastersEmpty')}
          </p>
        ) : masters.map((master) => (
          <div
            key={master.id}
            className="col-span-12 sm:col-span-6 md:col-span-3"
          >
            <MasterCard master={master} compact />
          </div>
        ))}
      </div>
    </div>
  );
};
