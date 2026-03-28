import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ErrorState } from '@/components/common/States';
import { useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { useUserCity } from '@/hooks/useUserCity';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { MastersFilterItem } from '@/types';
import { CATEGORY_META, CATEGORY_DEFAULT_META } from '@/constants';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';

function CategoryCardSkeleton() {
    return (
        <div className="rounded-xl sm:rounded-2xl bg-[#F9FAFB] border border-gray-200/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20 p-3 sm:p-4 lg:p-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl" />
            <Skeleton className="h-3 w-16 sm:h-3.5 sm:w-20 lg:h-4 lg:w-24" />
            <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-14 lg:h-3 lg:w-16" />
        </div>
    );
}

type PopularCategoriesSectionProps = {
  className?: string;
};

export const PopularCategoriesSection = ({ className }: PopularCategoriesSectionProps) => {
    const { t, i18n } = useTranslation();
    const { data: filtersData, isLoading, isError, error, refetch } = useMastersFiltersQuery(
      undefined,
      {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
        pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
      },
    );
    const { citySlug } = useUserCity();
    const [expanded, setExpanded] = useState(false);
    const isLg = useMediaQuery('(min-width: 1024px)');
    const initialVisible = isLg ? 12 : 6;

    const categories = filtersData?.categories ?? [];
    const visibleCategories = expanded ? categories : categories.slice(0, initialVisible);
    const hasMore = categories.length > initialVisible;

    if (isLoading) {
        return (
            <div className={cn('mb-6 md:mb-8', className)}>
                <div className="mb-6 text-center">
                    <Skeleton className="h-8 w-72 mx-auto mb-2" />
                    <Skeleton className="h-4 w-60 mx-auto" />
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4">
                    {Array.from({ length: initialVisible }).map((_, i) => (
                        <CategoryCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cn('mb-6 md:mb-8', className)}>
                <div className="mb-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5">
                        {t('home.popularCategories.title')}
                    </h2>
                    <p className="text-muted-foreground text-[0.9375rem] mb-4">
                        {t('home.popularCategories.subtitle')}
                    </p>
                </div>
                <ErrorState error={error} onRetry={refetch} />
            </div>
        );
    }

    if (!categories.length) return null;

    return (
        <div className={cn('mb-6 md:mb-8', className)}>
            <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5">
                    {t('home.popularCategories.title')}
                </h2>
                <p className="text-muted-foreground text-[0.9375rem]">
                    {t('home.popularCategories.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4">
                {visibleCategories.map((cat: MastersFilterItem, index: number) => {
                    const meta = CATEGORY_META[cat.slug] ?? CATEGORY_DEFAULT_META;
                    const Icon = meta.icon;
                    const mastersCount = cat.count ?? 0;

                    const translatedName = getTranslatedCategoryName(t, cat, i18n.language);

                    const mastersLabel =
                        i18n.language === 'ru'
                            ? getMastersLabelRu(mastersCount)
                            : i18n.language === 'ro'
                                ? `${mastersCount} meșteri`
                                : `${mastersCount} masters`;

                    return (
                        <ScrollReveal
                            key={cat.id}
                            delay={index * 0.03}
                            duration={0.35}
                            className="h-full"
                        >
                            <RouterLink
                                to={`/masters?category=${cat.slug}${citySlug ? `&city=${citySlug}` : ''}`}
                                className={cn(
                                    'group flex flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 h-full min-h-0',
                                    'bg-[#F9FAFB] border border-gray-200/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20',
                                    'hover:-translate-y-1 hover:shadow-md hover:shadow-black/10',
                                    'transition duration-300 cursor-pointer'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl shrink-0',
                                        'bg-gradient-to-br shadow-md',
                                        'group-hover:scale-110 transition-transform duration-300',
                                        meta.gradient,
                                    )}
                                >
                                    {(cat.icon && String(cat.icon).trim()) ? (
                                        <span
                                            className="text-lg sm:text-xl lg:text-2xl leading-none"
                                            aria-hidden
                                        >
                                            {cat.icon}
                                        </span>
                                    ) : (
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                                    )}
                                </div>

                                <div className="text-center min-w-0 w-full flex flex-col items-center gap-0.5">
                                    <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground leading-tight line-clamp-2">
                                        {translatedName}
                                    </p>
                                    <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
                                        {mastersLabel}
                                    </p>
                                </div>
                            </RouterLink>
                        </ScrollReveal>
                    );
                })}
            </div>

            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setExpanded((v) => !v)}
                        className="gap-2"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                {t('home.popularCategories.showLess')}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                {t('home.popularCategories.moreCategories')}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

/**
 * Russian pluralization for "мастер / мастера / мастеров"
 */
function getMastersLabelRu(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} мастер`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} мастера`;
    return `${count} мастеров`;
}
