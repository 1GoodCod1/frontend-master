import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Grid3x3, Search, X } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

function CategoryCardSkeleton() {
    return (
        <div className="rounded-xl sm:rounded-2xl bg-[#F9FAFB] border border-gray-200/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20 p-3 sm:p-4 lg:p-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full" />
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
    const [megaOpen, setMegaOpen] = useState(false);
    const [search, setSearch] = useState('');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const initialVisible = isLg ? 12 : 6;

    const categories = useMemo(
      () => filtersData?.categories ?? [],
      [filtersData?.categories],
    );
    const visibleCategories = categories.slice(0, initialVisible);
    const hasMore = categories.length > initialVisible;

    const normalizedSearch = search.trim().toLowerCase();
    const filteredCategories = useMemo(() => {
        if (!normalizedSearch) return categories;
        return categories.filter((c) =>
            getTranslatedCategoryName(t, c, i18n.language)
                .toLowerCase()
                .includes(normalizedSearch),
        );
    }, [categories, normalizedSearch, t, i18n.language]);

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
                    <h2
                        className={cn(
                            'text-2xl sm:text-3xl font-bold tracking-tight',
                            'text-slate-800 dark:text-slate-100',
                        )}
                    >
                        {t('home.popularCategories.title')}
                    </h2>
                    <p
                        className={cn(
                            'mt-2 text-sm sm:text-base max-w-lg mx-auto',
                            'text-slate-500 dark:text-slate-400',
                        )}
                    >
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
                <h2
                    className={cn(
                        'text-2xl sm:text-3xl font-bold tracking-tight',
                        'text-slate-800 dark:text-slate-100',
                    )}
                >
                    {t('home.popularCategories.title')}
                </h2>
                <p
                    className={cn(
                        'mt-2 text-sm sm:text-base max-w-lg mx-auto',
                        'text-slate-500 dark:text-slate-400',
                    )}
                >
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
                                        'flex items-center justify-center shrink-0 h-10 sm:h-12 lg:h-14',
                                        'group-hover:scale-110 transition-transform duration-300',
                                    )}
                                >
                                    {(cat.icon && String(cat.icon).trim()) ? (
                                        <span
                                            className="text-2xl sm:text-3xl lg:text-4xl leading-none opacity-90 group-hover:opacity-100 transition"
                                            aria-hidden
                                        >
                                            {cat.icon}
                                        </span>
                                    ) : (
                                        <Icon
                                            className={cn(
                                                'h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 transition-colors',
                                                meta.color,
                                            )}
                                            strokeWidth={1.5}
                                        />
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
                        onClick={() => setMegaOpen(true)}
                        className="gap-2"
                    >
                        <Grid3x3 className="h-4 w-4" />
                        {t('home.popularCategories.allCategories', { defaultValue: 'All categories' })}
                        <span className="text-xs text-muted-foreground ml-1">
                            ({categories.length})
                        </span>
                    </Button>
                </div>
            )}

            {/* MEGA-MENU: full catalog with search */}
            <Dialog open={megaOpen} onOpenChange={setMegaOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0">
                    <DialogHeader className="px-5 sm:px-6 pt-5 pb-3 border-b border-border">
                        <DialogTitle className="text-lg sm:text-xl font-bold">
                            {t('home.popularCategories.allCategories', { defaultValue: 'All categories' })}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({categories.length})
                            </span>
                        </DialogTitle>
                        <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('home.popularCategories.searchPlaceholder', {
                                    defaultValue: 'Search by category name…',
                                })}
                                className="w-full h-10 pl-9 pr-9 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                                    aria-label="Clear"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
                        {filteredCategories.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-12">
                                {t('home.popularCategories.noResults', {
                                    defaultValue: 'No categories found',
                                })}
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {filteredCategories.map((cat) => {
                                    const meta = CATEGORY_META[cat.slug] ?? CATEGORY_DEFAULT_META;
                                    const Icon = meta.icon;
                                    const name = getTranslatedCategoryName(t, cat, i18n.language);
                                    const count = cat.count ?? 0;
                                    return (
                                        <RouterLink
                                            key={cat.id}
                                            to={`/masters?category=${cat.slug}${citySlug ? `&city=${citySlug}` : ''}`}
                                            onClick={() => setMegaOpen(false)}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                                                {cat.icon && String(cat.icon).trim() ? (
                                                    <span className="text-2xl leading-none opacity-90 group-hover:opacity-100 transition" aria-hidden>
                                                        {cat.icon}
                                                    </span>
                                                ) : (
                                                    <Icon
                                                        className={cn('h-5 w-5', meta.color)}
                                                        strokeWidth={1.5}
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary dark:group-hover:text-[#E97525] transition-colors">
                                                    {name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {count > 0
                                                        ? `${count} ${i18n.language === 'ru' ? getMastersLabelRu(count).split(' ')[1] : i18n.language === 'ro' ? 'meșteri' : 'masters'}`
                                                        : '—'}
                                                </p>
                                            </div>
                                        </RouterLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
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
