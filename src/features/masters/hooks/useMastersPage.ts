import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useMastersFiltersQuery,
  useMastersSearchQuery,
  type MastersQuery,
} from '@/features/masters/mastersApi';
import { usePromotionsActiveQuery } from '@/features/promotions/promotionsApi';
import { useRecommendationsTrackMutation } from '@/features/recommendations/recommendationsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { SortBy, SortOrder } from '@/types/sort';
import type { MastersFilterItem, PublicMaster } from '@/types';
import { useTranslation } from 'react-i18next';
import { publicCachePolicy } from '@/config/publicCache';
import { getPersistedViewMode, setPersistedViewMode, type ViewMode } from '@/utils/tracking';

const VALID_SORT_VALUES: SortBy[] = [
  'all',
  'createdAt',
  'rating',
  'price',
];

export type MastersPageQuery = {
  page: number;
  limit: number;
  q: string;
  categoryValue: string;
  cityValue: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  availableNow: boolean;
  hasPromotion: boolean;
  minPrice: number;
  maxPrice: number;
  minRating: number;
};

function parseQueryFromUrl(searchParams: URLSearchParams): Partial<MastersPageQuery> {
  const urlQ = searchParams.get('q');
  const urlSortBy = searchParams.get('sortBy') as SortBy | null;
  const urlSortOrder = searchParams.get('sortOrder') as SortOrder | null;
  const urlCategoryId = searchParams.get('category') ?? searchParams.get('categoryId');
  const urlCityId = searchParams.get('city') ?? searchParams.get('cityId');
  const urlAvailable = searchParams.get('availableNow');
  const urlHasPromotion = searchParams.get('hasPromotion');
  const urlMinPrice = searchParams.get('minPrice');
  const urlMaxPrice = searchParams.get('maxPrice');
  const urlMinRating = searchParams.get('minRating');

  return {
    q: urlQ || '',
    categoryValue: urlCategoryId || '',
    cityValue: urlCityId || '',
    sortBy:
      urlSortBy && VALID_SORT_VALUES.includes(urlSortBy) ? urlSortBy : 'all',
    sortOrder:
      urlSortOrder && ['asc', 'desc'].includes(urlSortOrder) ? urlSortOrder : 'desc',
    availableNow: urlAvailable === 'true',
    hasPromotion: urlHasPromotion === 'true',
    minPrice: urlMinPrice ? Number(urlMinPrice) : 0,
    maxPrice: urlMaxPrice ? Number(urlMaxPrice) : 5000,
    minRating: urlMinRating ? Number(urlMinRating) : 0,
  };
}

export function useMastersPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMastersFiltersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
  });
  const { data: activePromotions = [] } = usePromotionsActiveQuery({ limit: 50 });
  const [track] = useRecommendationsTrackMutation();
  const isInitialMount = useRef(true);

  const [query, setQuery] = useState<MastersPageQuery>(() => {
    const parsed = parseQueryFromUrl(searchParams);
    return {
      page: 1,
      limit: 20,
      q: parsed.q ?? '',
      categoryValue: parsed.categoryValue ?? '',
      cityValue: parsed.cityValue ?? '',
      sortBy: (parsed.sortBy ?? 'all') as SortBy,
      sortOrder: (parsed.sortOrder ?? 'desc') as SortOrder,
      availableNow: parsed.availableNow ?? false,
      hasPromotion: parsed.hasPromotion ?? false,
      minPrice: parsed.minPrice ?? 0,
      maxPrice: parsed.maxPrice ?? 5000,
      minRating: parsed.minRating ?? 0,
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(
    query.availableNow || query.hasPromotion || query.minPrice > 0 || query.maxPrice < 5000 || query.minRating > 0,
  );
  const [viewMode, setViewModeState] = useState<ViewMode>(getPersistedViewMode);
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    setPersistedViewMode(mode);
  };
  const [priceMinLocal, setPriceMinLocal] = useState(query.minPrice);
  const [priceMaxLocal, setPriceMaxLocal] = useState(query.maxPrice);
  /** Snapshot of query-driven prices; when they change (reset, URL commit), sync slider locals. */
  const [prevQueryPrices, setPrevQueryPrices] = useState({
    min: query.minPrice,
    max: query.maxPrice,
  });

  if (
    query.minPrice !== prevQueryPrices.min ||
    query.maxPrice !== prevQueryPrices.max
  ) {
    setPrevQueryPrices({ min: query.minPrice, max: query.maxPrice });
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
    if (query.minRating > 0) params.set('minRating', String(query.minRating));
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
    query.minRating,
    setSearchParams,
  ]);

  const debouncedQ = useDebounce(query.q, 400);
  const debouncedMinPrice = useDebounce(query.minPrice, 500);
  const debouncedMaxPrice = useDebounce(query.maxPrice, 500);

  useEffect(() => {
    const searchQuery = debouncedQ.trim() || undefined;
    const categoryId = query.categoryValue || undefined;
    const cityId = query.cityValue || undefined;
    if (searchQuery || categoryId || cityId) {
      track({ action: 'filter', searchQuery, categoryId, cityId }).catch(() => {});
    }
  }, [debouncedQ, query.categoryValue, query.cityValue, track]);

  const categories = filters.data?.categories ?? [];
  const cities = filters.data?.cities ?? [];
  const filtersPriceRange = filters.data?.priceRange;
  const availableNowCount = filters.data?.availableNowCount ?? 0;
  const hasPromotionCount = filters.data?.hasPromotionCount ?? 0;

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
    [priceRange.min, priceRange.max],
  );
  const thumbPrimaryClass =
    '!bg-primary !border-primary dark:!bg-[#E97525] dark:!border-[#E97525]';

  const promotionDiscountByMasterId = useMemo((): Record<string, number> => {
    const record: Record<string, number> = {};
    for (const p of activePromotions) {
      const id = p.masterId ?? (p.master as { id?: string })?.id;
      if (id && typeof p.discount === 'number' && record[id] === undefined)
        record[id] = p.discount;
    }
    return record;
  }, [activePromotions]);

  const getCategoryLabel = (c: MastersFilterItem) => {
    const slug = c?.slug ?? c?.value;
    return slug
      ? t(`categories.${slug}`, { defaultValue: c?.name ?? c?.value ?? '' }) ||
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

  const searchArgs = useMemo((): MastersQuery => {
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
    if (query.minRating > 0) a.minRating = query.minRating;
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
    query.minRating,
    debouncedQ,
    debouncedMinPrice,
    debouncedMaxPrice,
    priceRange.min,
    priceRange.max,
  ]);

  const list = useMastersSearchQuery(searchArgs);
  const items: PublicMaster[] = list.data?.items ?? [];
  const total = list.data?.meta?.total ?? items.length;
  const totalPages = list.data?.meta?.totalPages ?? Math.ceil(total / query.limit);
  const canPrev = query.page > 1;
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
      minRating: 0,
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
    query.minRating > 0,
    query.q.trim(),
    query.sortBy !== 'all',
  ].filter(Boolean).length;

  const clearFiltersForEmpty = () => {
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
      minRating: 0,
    }));
  };

  return {
    t,
    query,
    setQuery,
    showAdvanced,
    setShowAdvanced,
    viewMode,
    setViewMode,
    priceMinLocal,
    setPriceMinLocal,
    priceMaxLocal,
    setPriceMaxLocal,
    priceRange,
    priceMinClamp,
    priceMaxClamp,
    clampedMinPrice,
    clampedMaxPrice,
    priceStep,
    thumbPrimaryClass,
    categories,
    cities,
    availableNowCount,
    hasPromotionCount,
    getCategoryLabel,
    getCityLabel,
    getCategoryValue,
    getCityValue,
    filters,
    list,
    items,
    total,
    totalPages,
    canPrev,
    canNext,
    resetFilters,
    activeFilterCount,
    clearFiltersForEmpty,
    promotionDiscountByMasterId,
  };
}
