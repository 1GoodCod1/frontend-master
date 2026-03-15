import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ErrorState } from '@/components/common/States';
import { useCategoriesWithCountsQuery } from '@/features/categories/categoriesApi';
import { useUserCity } from '@/hooks/useUserCity';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { CategoryDto } from '@/types';
import {
    Wrench,
    Smartphone,
    HardHat,
    Paintbrush,
    Droplets,
    Zap,
    Sofa,
    SparklesIcon,
    Truck,
    Package,
    Scissors,
    Camera,
    Car,
    TreePine,
    Home,
    DoorOpen,
    Snowflake,
    Settings,
    GraduationCap,
    PartyPopper,
    Scale,
    Calculator,
    Baby,
    PawPrint,
    Flame,
    Plug,
    Tv,
    Bug,
    LayoutGrid,
    type LucideIcon,
} from 'lucide-react';

/** Maps category slugs to Lucide icons and gradient colors */
const CATEGORY_META: Record<string, { icon: LucideIcon; gradient: string }> = {
    'remont-tehniki': { icon: Wrench, gradient: 'from-orange-500 to-amber-500' },
    'remont-telefonov-pk': { icon: Smartphone, gradient: 'from-blue-500 to-sky-400' },
    stroitelstvo: { icon: HardHat, gradient: 'from-red-500 to-rose-400' },
    'otdelochnye-raboty': { icon: Paintbrush, gradient: 'from-violet-500 to-purple-400' },
    santehnika: { icon: Droplets, gradient: 'from-cyan-500 to-teal-400' },
    elektrika: { icon: Zap, gradient: 'from-yellow-500 to-amber-400' },
    mebel: { icon: Sofa, gradient: 'from-emerald-500 to-green-400' },
    'uborka-klining': { icon: SparklesIcon, gradient: 'from-sky-500 to-blue-400' },
    'kurierskie-uslugi': { icon: Truck, gradient: 'from-teal-500 to-emerald-400' },
    'gruzoperevozki-pereezdy': { icon: Package, gradient: 'from-indigo-500 to-violet-400' },
    'uslugi-krasoty': { icon: Scissors, gradient: 'from-pink-500 to-rose-400' },
    'foto-video': { icon: Camera, gradient: 'from-fuchsia-500 to-pink-400' },
    'remont-avto': { icon: Car, gradient: 'from-slate-600 to-gray-500' },
    'landshaft-sad': { icon: TreePine, gradient: 'from-lime-500 to-green-400' },
    'krovlya-fasad': { icon: Home, gradient: 'from-amber-600 to-orange-400' },
    'okna-dveri': { icon: DoorOpen, gradient: 'from-blue-600 to-indigo-400' },
    'kondicionery-ventilyaciya': { icon: Snowflake, gradient: 'from-cyan-400 to-blue-300' },
    'svarka-metalloobrabotka': { icon: Settings, gradient: 'from-gray-500 to-zinc-400' },
    'repetitorstvo-obuchenie': { icon: GraduationCap, gradient: 'from-blue-500 to-cyan-400' },
    'svadby-prazdniki': { icon: PartyPopper, gradient: 'from-rose-500 to-pink-400' },
    'yuridicheskie-uslugi': { icon: Scale, gradient: 'from-slate-500 to-gray-400' },
    'buhgalteriya-nalogi': { icon: Calculator, gradient: 'from-emerald-600 to-teal-400' },
    'uhod-za-detmi': { icon: Baby, gradient: 'from-pink-400 to-rose-300' },
    'uhod-za-zhivotnymi': { icon: PawPrint, gradient: 'from-amber-500 to-yellow-400' },
    'ritualnye-uslugi': { icon: Flame, gradient: 'from-gray-600 to-slate-500' },
    'remont-bytovoy-tehniki': { icon: Plug, gradient: 'from-orange-600 to-amber-400' },
    'ustanovka-tehniki': { icon: Tv, gradient: 'from-indigo-600 to-blue-400' },
    'dezinsektciya-deratizaciya': { icon: Bug, gradient: 'from-green-600 to-lime-400' },
};

const DEFAULT_META = { icon: LayoutGrid, gradient: 'from-primary to-primary/70' };

function CategoryCardSkeleton() {
    return (
        <div className="rounded-xl sm:rounded-2xl bg-white/95 shadow-md shadow-black/5 dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20 p-3 sm:p-4 lg:p-5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl" />
            <Skeleton className="h-3 w-16 sm:h-3.5 sm:w-20 lg:h-4 lg:w-24" />
            <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-14 lg:h-3 lg:w-16" />
        </div>
    );
}

export const PopularCategoriesSection = () => {
    const { t, i18n } = useTranslation();
    const { data, isLoading, isError, error, refetch } = useCategoriesWithCountsQuery();
    const { citySlug } = useUserCity();
    const [expanded, setExpanded] = useState(false);
    const isLg = useMediaQuery('(min-width: 1024px)');
    const initialVisible = isLg ? 12 : 6;

    const categories = (data ?? []) as CategoryDto[];
    const visibleCategories = expanded ? categories : categories.slice(0, initialVisible);
    const hasMore = categories.length > initialVisible;

    if (isLoading) {
        return (
            <div className="mb-6 md:mb-8">
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
            <div className="mb-6 md:mb-8">
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
        <div className="mb-6 md:mb-8">
            <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5">
                    {t('home.popularCategories.title')}
                </h2>
                <p className="text-muted-foreground text-[0.9375rem]">
                    {t('home.popularCategories.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4">
                {visibleCategories.map((cat: CategoryDto, index: number) => {
                    const meta = CATEGORY_META[cat.slug] ?? DEFAULT_META;
                    const Icon = meta.icon;
                    const mastersCount = cat._count?.masters ?? 0;

                    // Единый справочник переводов категорий (citiesCategories)
                    const translatedName =
                        t(`categories.${cat.slug}`, { defaultValue: '' }) || cat.name;

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
                                    'bg-white/95 shadow-md shadow-black/5 dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20',
                                    'hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8',
                                    'transition-all duration-300 cursor-pointer'
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
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
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
