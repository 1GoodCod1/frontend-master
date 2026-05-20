import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ErrorState } from '@/components/common/States';
import { SectionHead } from '@/components/home/SectionHead';
import { CityCard } from '@/components/cities/CityCard';
import { useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { paths } from '@/constants/routes';
import { categoriesGridClassName, categoryCardSkeletonClassName } from '@/utils/categoryIconStyle';
import { CITIES_SECTION_ACCENT, HOME_CITIES_LIMIT } from '@/constants/home';
import { cn } from '@/lib/utils';

function CityCardSkeleton() {
  return (
    <div className={categoryCardSkeletonClassName}>
      <Skeleton className="h-9 w-9 rounded-[10px] shrink-0" />
      <div className="flex flex-col flex-1 min-h-0 pt-2.5">
        <Skeleton className="h-[33px] w-full" />
        <Skeleton className="h-3 w-1/2 mt-auto" />
      </div>
    </div>
  );
}

type PopularCitiesSectionProps = {
  className?: string;
};

export const PopularCitiesSection = ({ className }: PopularCitiesSectionProps) => {
  const { t } = useTranslation();
  const { data: filtersData, isLoading, isError, error, refetch } = useMastersFiltersQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
      pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
    },
  );

  const cities = useMemo(() => {
    const list = [...(filtersData?.cities ?? [])];
    list.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    return list.slice(0, HOME_CITIES_LIMIT);
  }, [filtersData?.cities]);

  const totalCities = filtersData?.cities?.length ?? 0;

  const moldovaBadge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
        'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400',
      )}
    >
      <Globe size={11} />
      {t('home.popularCities.moldova')}
    </span>
  );

  const sectionHead = (
    <SectionHead
      kicker={t('home.kickerCities', { defaultValue: 'Coverage MD' })}
      title={t('home.popularCities.title', { count: HOME_CITIES_LIMIT })}
      accent={CITIES_SECTION_ACCENT}
      trailing={moldovaBadge}
      link={
        totalCities > 0
          ? {
              label: t('home.popularCities.viewAll', { count: totalCities }),
              href: paths.masters,
            }
          : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div className={className}>
        <div className="mb-[26px]">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
        <div className={categoriesGridClassName}>
          {Array.from({ length: HOME_CITIES_LIMIT }).map((_, i) => (
            <CityCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        {sectionHead}
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!cities.length) return null;

  return (
    <div className={className}>
      {sectionHead}
      <div className={categoriesGridClassName}>
        {cities.map((city, index) => (
          <ScrollReveal key={city.id} delay={index * 0.03} duration={0.35} className="h-full">
            <CityCard city={city} href={`${paths.masters}?city=${city.slug}`} className="h-full" />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
