import { useMemo, useState, useEffect, useRef, lazy, Suspense, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtuosoGrid } from 'react-virtuoso';
import {
  Search,
  SlidersHorizontal,
  Map,
  List,
  ChevronDown,
  ChevronUp,
  CircleDot,
  DollarSign,
  Tag,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  useMastersFiltersQuery,
  useMastersSearchQuery,
  type MastersQuery,
} from '@/features/masters/mastersApi';
import { usePromotionsActiveQuery } from '@/features/promotions/promotionsApi';
import { useRecommendationsTrackMutation } from '@/features/recommendations/recommendationsApi';
import { ErrorState } from '@/components/common/States';
import { MasterCard } from '@/components/ui/MasterCard';
import { SearchInputWithHistory } from '@/features/masters/components/search/SearchInputWithHistory';
import { EmptyState } from '@/components/ui/EmptyState';
import type { MastersFilterItem, PublicMaster } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { SortBy, SortOrder, defaultSortOrder } from '@/types/sort';
import { RecentlyViewed } from '@/components/home/recommendations/RecentlyViewed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

const MastersMap = lazy(() =>
  import('@/features/masters/components/MastersMap').then((m) => ({
    default: m.MastersMap,
  }))
);

function CardSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-xl border border-gray-200 dark:border-white/[0.08] bg-card p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-lg shadow-black/5 dark:shadow-none">
      <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-full" />
      <Skeleton className="h-5 sm:h-6 w-[70%]" />
      <Skeleton className="h-4 sm:h-5 w-[50%]" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded" />
        ))}
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-card animate-pulse" style={{ minHeight: 400 }}>
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Map className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground/40">Loading map…</p>
        </div>
      </div>
    </div>
  );
}

const VirtualizedGridList = (props: ComponentProps<'div'>) => (
  <div
    {...props}
    className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]"
  />
);

const VirtualizedGridItem = (props: ComponentProps<'div'>) => (
  <div {...props} className="min-w-0" />
);

export default function MastersPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMastersFiltersQuery();
  const { data: activePromotions = [] } = usePromotionsActiveQuery({ limit: 100 });
  const promotionDiscountByMasterId = useMemo((): Record<string, number> => {
    const record: Record<string, number> = {};
    for (const p of activePromotions) {
      const id = p.masterId ?? (p.master as { id?: string })?.id;
      if (id && typeof p.discount === 'number' && record[id] === undefined) record[id] = p.discount;
    }
    return record;
  }, [activePromotions]);

  const urlQ = searchParams.get('q');
  const urlSortBy = searchParams.get('sortBy') as SortBy | null;
  const urlSortOrder = searchParams.get('sortOrder') as SortOrder | null;
  const urlCategoryId = searchParams.get('category') ?? searchParams.get('categoryId');
  const urlCityId = searchParams.get('city') ?? searchParams.get('cityId');
  const urlAvailable = searchParams.get('availableNow');
  const urlHasPromotion = searchParams.get('hasPromotion');
  const urlMinPrice = searchParams.get('minPrice');
  const urlMaxPrice = searchParams.get('maxPrice');

  const validSortValues: SortBy[] = [
    'all',
    'createdAt',
    'rating',
    'views',
    'leadsCount',
    'price',
    'totalReviews',
    'updatedAt',
  ];

  const [query, setQuery] = useState({
    page: 1,
    limit: 30,
    q: urlQ || '',
    categoryValue: urlCategoryId || '',
    cityValue: urlCityId || '',
    sortBy: (urlSortBy && validSortValues.includes(urlSortBy)
      ? urlSortBy
      : 'all') as SortBy,
    sortOrder: (urlSortOrder && ['asc', 'desc'].includes(urlSortOrder)
      ? urlSortOrder
      : 'desc') as SortOrder,
    availableNow: urlAvailable === 'true',
    hasPromotion: urlHasPromotion === 'true',
    minPrice: urlMinPrice ? Number(urlMinPrice) : 0,
    maxPrice: urlMaxPrice ? Number(urlMaxPrice) : 5000,
  });

  const [showAdvanced, setShowAdvanced] = useState(
    query.availableNow || query.hasPromotion || query.minPrice > 0 || query.maxPrice < 5000
  );
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // Локальные значения слайдеров — обновляем query только по commit, чтобы не лагало при перетаскивании
  const [priceMinLocal, setPriceMinLocal] = useState(query.minPrice);
  const [priceMaxLocal, setPriceMaxLocal] = useState(query.maxPrice);

  const isInitialMount = useRef(true);

  // Синхронизация локальных значений слайдеров с query (ввод в поля, сброс фильтров)
  const [prevPrice, setPrevPrice] = useState({ min: query.minPrice, max: query.maxPrice });
  if (query.minPrice !== prevPrice.min || query.maxPrice !== prevPrice.max) {
    setPrevPrice({ min: query.minPrice, max: query.maxPrice });
    setPriceMinLocal(query.minPrice);
    setPriceMaxLocal(query.maxPrice);
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (query.q.trim()) params.set('q', query.q.trim());
    if (query.sortBy !== 'all') {
      params.set('sortBy', query.sortBy);
      params.set('sortOrder', query.sortOrder);
    }
    if (query.categoryValue) params.set('category', query.categoryValue);
    if (query.cityValue) params.set('city', query.cityValue);
    if (query.availableNow) params.set('availableNow', 'true');
    if (query.hasPromotion) params.set('hasPromotion', 'true');
    if (query.minPrice > 0) params.set('minPrice', String(query.minPrice));
    if (query.maxPrice < 5000) params.set('maxPrice', String(query.maxPrice));
    setSearchParams(params, { replace: true });
  }, [
    query.q,
    query.sortBy,
    query.sortOrder,
    query.categoryValue,
    query.cityValue,
    query.availableNow,
    query.hasPromotion,
    query.minPrice,
    query.maxPrice,
    setSearchParams,
  ]);

  const debouncedQ = useDebounce(query.q, 400);
  const debouncedMinPrice = useDebounce(query.minPrice, 500);
  const debouncedMaxPrice = useDebounce(query.maxPrice, 500);
  const [track] = useRecommendationsTrackMutation();

  useEffect(() => {
    const searchQuery = debouncedQ.trim() || undefined;
    const categoryId = query.categoryValue || undefined;
    const cityId = query.cityValue || undefined;
    if (searchQuery || categoryId || cityId) {
      track({ action: 'filter', searchQuery, categoryId, cityId }).catch(
        () => { }
      );
    }
  }, [debouncedQ, query.categoryValue, query.cityValue, track]);

  const categories = filters.data?.categories ?? [];
  const cities = filters.data?.cities ?? [];
  const filtersPriceRange = filters.data?.priceRange;
  // Min always from 0; ensure min < max so sliders are never stuck
  const priceRange = useMemo(() => {
    const raw = filtersPriceRange ?? { min: 0, max: 5000 };
    const { min, max } = raw;
    const effectiveMax = min >= max ? Math.max(5000, max + 500) : max;
    return { min: 0, max: effectiveMax };
  }, [filtersPriceRange]);
  const priceMinClamp = (v: number) =>
    Math.max(priceRange.min, Math.min(v, priceRange.max));
  const priceMaxClamp = (v: number) =>
    Math.min(priceRange.max, Math.max(v, priceRange.min));
  const clampedMinPrice = priceMinClamp(query.minPrice);
  const clampedMaxPrice = priceMaxClamp(query.maxPrice);
  const priceStep = useMemo(
    () => Math.max(1, Math.floor((priceRange.max - priceRange.min) / 100)),
    [priceRange.min, priceRange.max]
  );
  const thumbPrimaryClass = '!bg-primary !border-primary dark:!bg-[#E97525] dark:!border-[#E97525]';

  const getCategoryLabel = (c: MastersFilterItem) => {
    const slug = c?.slug ?? c?.value;
    return slug
      ? t(`categories.${slug}`, {
        defaultValue: c?.name ?? c?.value ?? '',
      }) ||
      c?.name ||
      c?.value ||
      ''
      : c?.name ?? c?.value ?? '';
  };
  const getCityLabel = (c: MastersFilterItem) => {
    const slug = c?.slug ?? c?.value;
    return slug
      ? t(`cities.${slug}`, { defaultValue: c?.name ?? c?.value ?? '' }) ||
      c?.name ||
      c?.value ||
      ''
      : c?.name ?? c?.value ?? '';
  };
  const getCategoryValue = (c: MastersFilterItem) =>
    String(c?.value ?? c?.slug ?? c?.id ?? c?.name ?? '');
  const getCityValue = (c: MastersFilterItem) =>
    String(c?.value ?? c?.slug ?? c?.id ?? c?.name ?? '');

  const searchArgs = useMemo(() => {
    const a: MastersQuery = {
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
    };
    if (debouncedQ.trim()) a.search = debouncedQ.trim();
    if (query.categoryValue) a.categoryId = query.categoryValue;
    if (query.cityValue) a.cityId = query.cityValue;
    if (query.sortBy !== 'all') a.sortBy = query.sortBy as MastersQuery['sortBy'];
    if (query.availableNow) a.availableNow = true;
    if (query.hasPromotion) a.hasPromotion = true;
    if (debouncedMinPrice > priceRange.min) a.minPrice = debouncedMinPrice;
    if (debouncedMaxPrice < priceRange.max) a.maxPrice = debouncedMaxPrice;
    return a;
  }, [
    query.page,
    query.limit,
    query.sortBy,
    query.sortOrder,
    query.categoryValue,
    query.cityValue,
    query.availableNow,
    query.hasPromotion,
    debouncedQ,
    debouncedMinPrice,
    debouncedMaxPrice,
    priceRange.min,
    priceRange.max,
  ]);

  const list = useMastersSearchQuery(searchArgs);
  const items: PublicMaster[] = list.data?.items ?? [];
  const total = list.data?.meta?.total ?? items.length;

  const canPrev = query.page > 1;
  const totalPages = list.data?.meta?.totalPages ?? Math.ceil(total / query.limit);
  const canNext = query.page < totalPages;

  const resetFilters = () => {
    setQuery((s) => ({
      ...s,
      page: 1,
      q: '',
      categoryValue: '',
      cityValue: '',
      sortBy: 'all',
      sortOrder: 'desc',
      availableNow: false,
      hasPromotion: false,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    }));
    setShowAdvanced(false);
  };

  const activeFilterCount = [
    query.categoryValue,
    query.cityValue,
    query.availableNow,
    query.hasPromotion,
    query.minPrice > priceRange.min,
    query.maxPrice < priceRange.max,
    query.q.trim(),
    query.sortBy !== 'all',
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-7xl mx-auto py-3 sm:py-5 md:py-6 lg:py-8 px-3 sm:px-4"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {t('masters.title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 sm:mt-1 text-sm sm:text-base">{t('masters.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 text-sm font-medium transition-all ${viewMode === 'list'
                  ? 'bg-[hsl(var(--button-bg))] text-white'
                  : 'bg-card hover:bg-primary/10 text-muted-foreground'
                }`}
            >
              <List className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('masters.listView')}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 text-sm font-medium transition-all ${viewMode === 'map'
                  ? 'bg-[hsl(var(--button-bg))] text-white'
                  : 'bg-card hover:bg-primary/10 text-muted-foreground'
                }`}
            >
              <Map className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('masters.mapView')}</span>
            </button>
          </div>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="shrink-0 gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-9 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 text-sm"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {t('common.reset')}
            {activeFilterCount > 0 && (
              <span className="ml-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters card */}
      <Card className="mb-3 sm:mb-5 md:mb-6 border border-gray-200 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-none">
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary text-primary-foreground shrink-0">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {t('masters.searchAndFilters')}
            </h2>
          </div>
          {filters.isError ? (
            <ErrorState
              error={filters.error}
              onRetry={filters.refetch}
            />
          ) : (
            <>
              {/* Main filters row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Search */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="masters-search">{t('masters.search')}</Label>
                  <SearchInputWithHistory
                    id="masters-search"
                    value={query.q}
                    onChange={(v) =>
                      setQuery((s) => ({
                        ...s,
                        page: 1,
                        q: v,
                      }))
                    }
                    placeholder={t('masters.searchPlaceholder')}
                    variant="default"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>{t('masters.category')}</Label>
                  <Select
                    value={query.categoryValue || 'all'}
                    onValueChange={(v) =>
                      setQuery((s) => ({
                        ...s,
                        page: 1,
                        categoryValue: v === 'all' ? '' : v,
                      }))
                    }
                    disabled={filters.isLoading}
                  >
                    <SelectTrigger className="w-full border-gray-200 dark:border-white/10 bg-secondary/80 focus:border-primary/30">
                      <SelectValue placeholder={t('common.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {categories.map((c: MastersFilterItem) => (
                        <SelectItem
                          key={c.id ?? c.slug ?? c.name}
                          value={getCategoryValue(c)}
                        >
                          {getCategoryLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label>{t('masters.city')}</Label>
                  <Select
                    value={query.cityValue || 'all'}
                    onValueChange={(v) =>
                      setQuery((s) => ({
                        ...s,
                        page: 1,
                        cityValue: v === 'all' ? '' : v,
                      }))
                    }
                    disabled={filters.isLoading}
                  >
                    <SelectTrigger className="w-full border-gray-200 dark:border-white/10 bg-secondary/80 focus:border-primary/30">
                      <SelectValue placeholder={t('common.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {cities.map((c: MastersFilterItem) => (
                        <SelectItem
                          key={c.id ?? c.slug ?? c.name}
                          value={getCityValue(c)}
                        >
                          {getCityLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="space-y-2">
                  <Label>{t('masters.sortBy')}</Label>
                  <Select
                    value={query.sortBy}
                    onValueChange={(v) => {
                      const nextSortBy = v as SortBy;
                      setQuery((s) => ({
                        ...s,
                        page: 1,
                        sortBy: nextSortBy,
                        sortOrder: defaultSortOrder(nextSortBy),
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-200 dark:border-white/10 bg-secondary/80 focus:border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('masters.sortDefault')}
                      </SelectItem>
                      <SelectItem value="createdAt">
                        {t('masters.sortNewest')}
                      </SelectItem>
                      <SelectItem value="rating">
                        {t('masters.sortRating')}
                      </SelectItem>
                      <SelectItem value="price">
                        {t('masters.sortPrice')}
                      </SelectItem>
                      <SelectItem value="totalReviews">
                        {t('masters.sortReviews')}
                      </SelectItem>
                      <SelectItem value="updatedAt">
                        {t('masters.sortUpdated')}
                      </SelectItem>
                      <SelectItem value="views">
                        {t('masters.sortViews')}
                      </SelectItem>
                      <SelectItem value="leadsCount">
                        {t('masters.sortLeads')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced toggle */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="gap-2 text-primary hover:bg-primary/10 w-full sm:w-auto justify-center"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('masters.advancedFilters')}
                    {showAdvanced ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200 dark:border-white/[0.08]">
                      {/* Available now */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-secondary/60 dark:bg-secondary/30 px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-200 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-green-500/15 dark:bg-green-400/15">
                            <CircleDot className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {t('masters.availableNow')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('masters.availableNowHint')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {query.availableNow ? t('masters.switchOn') : t('masters.switchOff')}
                          </span>
                          <Switch
                            size="large"
                            variant="green"
                            checked={query.availableNow}
                            onCheckedChange={(checked) =>
                              setQuery((s) => ({
                                ...s,
                                page: 1,
                                availableNow: checked,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* With promotion */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-secondary/60 dark:bg-secondary/30 px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-200 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-rose-500/15 dark:bg-rose-400/15">
                            <Tag className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {t('masters.withPromotion')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('masters.withPromotionHint')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {query.hasPromotion ? t('masters.switchOn') : t('masters.switchOff')}
                          </span>
                          <Switch
                            size="large"
                            variant="rose"
                            checked={query.hasPromotion}
                            onCheckedChange={(checked) =>
                              setQuery((s) => ({
                                ...s,
                                page: 1,
                                hasPromotion: checked,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Price range — отдельные прогресс-бары для мин и макс */}
                      <div className="space-y-4 rounded-xl bg-secondary/60 dark:bg-secondary/30 px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-200 dark:border-white/[0.06] md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/15">
                            <DollarSign className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {t('masters.priceRange')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {clampedMinPrice} – {clampedMaxPrice}{' '}
                              {t('masters.currency')}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {/* Мин: прогресс-бар + поле */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-xs font-medium text-foreground">
                                {t('masters.priceMin')}
                              </Label>
                              <span className="text-sm font-semibold tabular-nums text-primary">
                                {priceMinClamp(Math.min(priceMinLocal, priceMaxLocal))} {t('masters.currency')}
                              </span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1 min-w-0 [&_.relative]:!h-2.5 [&_.relative]:!rounded-full [&_.relative>:first-child]:!bg-primary dark:[&_.relative>:first-child]:!bg-[#E97525]">
                                <Slider
                                  value={[priceMinClamp(Math.min(priceMinLocal, priceMaxLocal))]}
                                  onValueChange={([v]) =>
                                    setPriceMinLocal(priceMinClamp(Math.min(v, priceMaxLocal)))
                                  }
                                  onValueCommit={([v]) =>
                                    setQuery((s) => ({
                                      ...s,
                                      page: 1,
                                      minPrice: priceMinClamp(Math.min(v, s.maxPrice)),
                                    }))
                                  }
                                  min={priceRange.min}
                                  max={priceMaxLocal}
                                  step={priceStep}
                                  thumbClassName={thumbPrimaryClass}
                                  className="w-full"
                                />
                              </div>
                              <Input
                                type="number"
                                min={priceRange.min}
                                max={clampedMaxPrice}
                                value={clampedMinPrice}
                                onChange={(e) => {
                                  const num = Number(e.target.value);
                                  if (!Number.isFinite(num)) return;
                                  const v = priceMinClamp(Math.min(num, query.maxPrice));
                                  setPriceMinLocal(v);
                                  setQuery((s) => ({ ...s, page: 1, minPrice: v }));
                                }}
                                className="h-8 w-20 text-sm border-gray-200 dark:border-white/10 bg-background shrink-0"
                              />
                            </div>
                          </div>
                          {/* Макс: прогресс-бар + поле */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-xs font-medium text-foreground">
                                {t('masters.priceMax')}
                              </Label>
                              <span className="text-sm font-semibold tabular-nums text-primary">
                                {priceMaxClamp(Math.max(priceMaxLocal, priceMinLocal))} {t('masters.currency')}
                              </span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1 min-w-0 [&_.relative]:!h-2.5 [&_.relative]:!rounded-full [&_.relative>:first-child]:!bg-primary dark:[&_.relative>:first-child]:!bg-[#E97525]">
                                <Slider
                                  value={[priceMaxClamp(Math.max(priceMaxLocal, priceMinLocal))]}
                                  onValueChange={([v]) =>
                                    setPriceMaxLocal(priceMaxClamp(Math.max(v, priceMinLocal)))
                                  }
                                  onValueCommit={([v]) =>
                                    setQuery((s) => ({
                                      ...s,
                                      page: 1,
                                      maxPrice: priceMaxClamp(Math.max(v, s.minPrice)),
                                    }))
                                  }
                                  min={priceMinLocal}
                                  max={priceRange.max}
                                  step={priceStep}
                                  thumbClassName={thumbPrimaryClass}
                                  className="w-full"
                                />
                              </div>
                              <Input
                                type="number"
                                min={clampedMinPrice}
                                max={priceRange.max}
                                value={clampedMaxPrice}
                                onChange={(e) => {
                                  const num = Number(e.target.value);
                                  if (!Number.isFinite(num)) return;
                                  const v = priceMaxClamp(Math.max(num, query.minPrice));
                                  setPriceMaxLocal(v);
                                  setQuery((s) => ({ ...s, page: 1, maxPrice: v }));
                                }}
                                className="h-8 w-20 text-sm border-gray-200 dark:border-white/10 bg-background shrink-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>

      <RecentlyViewed limit={6} />

      {/* Results */}
      {list.isLoading ? (
        viewMode === 'list' ? (
          <div
            className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <MapSkeleton />
        )
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length ? (
        <>
          <div className="mb-3 sm:mb-4 rounded-lg bg-primary/10 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">
              {t('masters.found', { count: total })}
            </p>
            {list.isFetching && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-primary/70">Updating…</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <VirtuosoGrid
                  useWindowScroll
                  totalCount={items.length}
                  components={{
                    List: VirtualizedGridList,
                    Item: VirtualizedGridItem,
                  }}
                  itemContent={(idx) => {
                    const m: PublicMaster = items[idx];
                    return (
                      <ScrollReveal delay={idx * 0.03} duration={0.4}>
                        <MasterCard
                          master={{
                            ...m,
                            displayName:
                              `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
                              'Master',
                          }}
                          compact
                          promotionDiscount={m?.id ? promotionDiscountByMasterId[m.id] : undefined}
                        />
                      </ScrollReveal>
                    );
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="h-[400px] sm:h-[450px] md:h-[500px]"
              >
                <Suspense fallback={<MapSkeleton />}>
                  <MastersMap
                    masters={items.map((m) => ({
                      ...m,
                      slug: m.slug ?? undefined,
                      displayName:
                        `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
                        'Master',
                    }))}
                    className="h-full"
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          <Card className="mt-6 sm:mt-8 mb-4 border border-gray-200 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-none">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  disabled={!canPrev || list.isFetching}
                  onClick={() =>
                    setQuery((s) => ({ ...s, page: s.page - 1 }))
                  }
                  className="min-h-[44px] sm:min-h-11 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:-translate-x-0.5 transition-transform"
                >
                  {t('common.prev')}
                </Button>
                <span className="px-3 sm:px-4 py-2 rounded-md bg-primary/10 font-semibold text-primary text-xs sm:text-sm md:text-base">
                  {t('common.page')} {query.page}{' '}
                  {totalPages > 0 &&
                    t('common.pageOf', { total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  disabled={!canNext || list.isFetching}
                  onClick={() =>
                    setQuery((s) => ({ ...s, page: s.page + 1 }))
                  }
                  className="min-h-[44px] sm:min-h-11 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:translate-x-0.5 transition-transform"
                >
                  {t('common.next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          title={t('masters.noMastersFound')}
          description={t('masters.noMastersDescription')}
          actionLabel={t('masters.clearFilters')}
          onAction={() =>
            setQuery((s) => ({
              ...s,
              page: 1,
              q: '',
              categoryValue: '',
              cityValue: '',
              availableNow: false,
              hasPromotion: false,
              minPrice: 0,
              maxPrice: 5000,
            }))
          }
          icon="🔎"
        />
      )}
    </motion.div>
  );
}
