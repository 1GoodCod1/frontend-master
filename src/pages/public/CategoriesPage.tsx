import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { SectionHead } from '@/components/home/SectionHead';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ErrorState } from '@/components/common/States';
import { Skeleton } from '@/components/ui/skeleton';
import { useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { useUserCity } from '@/hooks/useUserCity';
import { useIsDark } from '@/hooks/useIsDark';
import { paths } from '@/constants/routes';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { cn } from '@/lib/utils';
import {
  categoriesGridClassName,
  categoryCardSkeletonClassName,
  DISCOVER_SECTION_ACCENT,
} from '@/utils/categoryIconStyle';
import { surfaceCardCls } from '@/lib/surfaceCard';

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

export default function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const isDark = useIsDark();
  const { citySlug } = useUserCity();
  const [search, setSearch] = useState('');

  const { data: filtersData, isLoading, isError, error, refetch } = useMastersFiltersQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
      pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
    },
  );

  const categories = useMemo(
    () => filtersData?.categories ?? [],
    [filtersData?.categories],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return categories;
    return categories.filter((category) =>
      getTranslatedCategoryName(t, category, i18n.language)
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [categories, normalizedSearch, t, i18n.language]);

  const buildCategoryHref = (slug: string) =>
    `${paths.masters}?category=${slug}${citySlug ? `&city=${citySlug}` : ''}`;

  return (
    <>
      <SEOHead
        title={t('categoriesPage.title')}
        description={t('categoriesPage.subtitle')}
        keywords={t('home.seoKeywords')}
      />

      <div className="min-h-full bg-[hsl(var(--background))] dark:bg-[#0a0a0a]">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 py-8 md:py-12">
          <RouterLink
            to={paths.home}
            className={cn(
              'inline-flex items-center gap-2 text-sm mb-8 transition-colors',
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('categoriesPage.backHome')}
          </RouterLink>

          <SectionHead
            kicker={t('home.kickerDiscover', { defaultValue: 'Discover' })}
            title={t('categoriesPage.title')}
            accent={DISCOVER_SECTION_ACCENT}
            className="mb-8"
          />
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl -mt-4 mb-8">
            {t('categoriesPage.subtitle', { count: categories.length })}
          </p>

          <div className="relative mb-8 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('categoriesPage.searchPlaceholder')}
              className={cn(
                'w-full h-11 pl-10 pr-10 rounded-xl text-sm outline-none transition-colors focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30',
                surfaceCardCls,
                'dark:focus:border-sky-400/40',
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label={t('categoriesPage.clearSearch')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {isLoading && (
            <div className={categoriesGridClassName}>
              {Array.from({ length: 12 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && <ErrorState error={error} onRetry={refetch} />}

          {!isLoading && !isError && filteredCategories.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-16">
              {t('categoriesPage.noResults')}
            </p>
          )}

          {!isLoading && !isError && filteredCategories.length > 0 && (
            <div className={categoriesGridClassName}>
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  href={buildCategoryHref(category.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
