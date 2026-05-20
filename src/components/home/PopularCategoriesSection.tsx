import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ErrorState } from '@/components/common/States';
import { SectionHead } from '@/components/home/SectionHead';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { useUserCity } from '@/hooks/useUserCity';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { paths } from '@/constants/routes';
import {
  categoriesGridClassName,
  categoryCardSkeletonClassName,
  DISCOVER_SECTION_ACCENT,
} from '@/utils/categoryIconStyle';

function CategoryCardSkeleton() {
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

type PopularCategoriesSectionProps = {
  className?: string;
};

export const PopularCategoriesSection = ({ className }: PopularCategoriesSectionProps) => {
  const { t } = useTranslation();
  const { data: filtersData, isLoading, isError, error, refetch } = useMastersFiltersQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
      pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
    },
  );
  const { citySlug } = useUserCity();
  const isLg = useMediaQuery('(min-width: 1024px)');
  const initialVisible = isLg ? 12 : 6;

  const categories = useMemo(
    () => filtersData?.categories ?? [],
    [filtersData?.categories],
  );
  const visibleCategories = categories.slice(0, initialVisible);

  const buildCategoryHref = (slug: string) =>
    `${paths.masters}?category=${slug}${citySlug ? `&city=${citySlug}` : ''}`;

  const sectionHead = (
    <SectionHead
      kicker={t('home.kickerDiscover')}
      title={t('home.popularCategories.browseTitle')}
      accent={DISCOVER_SECTION_ACCENT}
      link={
        categories.length > 0
          ? {
              label: t('home.popularCategories.viewAll', { count: categories.length }),
              href: paths.categories,
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
          <div className="flex items-end justify-between gap-4">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-5 w-36 hidden sm:block" />
          </div>
        </div>
        <div className={categoriesGridClassName}>
          {Array.from({ length: initialVisible }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
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

  if (!categories.length) return null;

  return (
    <div className={className}>
      {sectionHead}

      <div className={categoriesGridClassName}>
        {visibleCategories.map((cat, index) => (
          <ScrollReveal
            key={cat.id}
            delay={index * 0.03}
            duration={0.35}
            className="h-full"
          >
            <CategoryCard category={cat} href={buildCategoryHref(cat.slug)} className="h-full" />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
