import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useRecommendationsSimilarQuery } from '@/features/recommendations/recommendationsApi';
import { MasterCard } from '@/components/ui/MasterCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecommendedMasterDto } from '@/types';

interface SimilarMastersProps {
  masterId: string;
  limit?: number;
}

export const SimilarMasters: React.FC<SimilarMastersProps> = ({
  masterId,
  limit = 4,
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useRecommendationsSimilarQuery({
    masterId,
    limit,
  });

  const masters = useMemo<RecommendedMasterDto[]>(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-6">
        <h3 className="mb-4 text-lg font-semibold">
          {t('masterDetails.similarMasters')}
        </h3>
        <div className="grid grid-cols-12 gap-4">
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

  if (!masters || masters.length === 0) {
    return null;
  }

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
        {masters.map((master) => (
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
