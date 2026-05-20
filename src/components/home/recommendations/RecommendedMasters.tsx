import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { useRecommendationsPersonalizedQuery } from '@/features/recommendations/recommendationsApi';
import { MasterCard } from '@/components/ui/MasterCard';
import { CardsSkeleton } from '@/components/common/Skeletons';
import type { RecommendedMasterDto } from '@/types';
import { useUserCity } from '@/hooks/useUserCity';

interface RecommendedMastersProps {
  limit?: number;
  title?: string;
  showReasons?: boolean;
  /** Переопределить город (иначе — из гео/сохранённого при согласии на город) */
  cityId?: string;
}

export const RecommendedMasters: React.FC<RecommendedMastersProps> = ({
  limit = 6,
  title,
  showReasons = true,
  cityId: cityIdProp,
}) => {
  const { t } = useTranslation();
  const { cityId: cityFromHook } = useUserCity();
  const cityIdForApi = cityIdProp ?? (cityFromHook || undefined);

  const { data, isLoading } = useRecommendationsPersonalizedQuery({
    limit,
    cityId: cityIdForApi,
  });
  const sectionTitle = title ?? t('home.recommendedForYou');

  const masters = useMemo<RecommendedMasterDto[]>(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  return (
    <section className="mb-10 md:mb-16">
      <div className="-ml-1 mb-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12">
            <TrendingUp className="h-5 w-5 shrink-0" strokeWidth={2} />
          </span>
          <h2 className="text-2xl font-semibold text-foreground md:text-[1.75rem]">
            {sectionTitle}
          </h2>
        </div>
        <p className="ml-14 text-muted-foreground">
          {t('home.recommendedSubtitle')}
        </p>
      </div>

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : !masters?.length ? null : (
        <div className="grid grid-cols-12 gap-6">
          {masters.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="col-span-12 sm:col-span-6 md:col-span-3"
            >
              <MasterCard
                master={{
                  ...m,
                  displayName:
                    `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
                    t('common.masterCard.masterNameFallback'),
                }}
                compact
                reasons={showReasons ? m.reasons : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
