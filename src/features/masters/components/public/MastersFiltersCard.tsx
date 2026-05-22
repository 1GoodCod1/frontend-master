import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, List, Map } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchInputWithHistory } from '@/features/masters/components/search/SearchInputWithHistory';
import type { SearchSuggestionEvent } from '@/features/masters/components/search/SearchInputWithHistory';
import { ErrorState } from '@/components/common/States';
import { MastersAdvancedFilters } from './MastersAdvancedFilters';
import type { MastersFilterItem } from '@/types';
import type { MastersPageQuery } from '@/features/masters/hooks/useMastersPage';
import { SortBy, defaultSortOrder } from '@/types/sort';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

type ViewMode = 'list' | 'map';

interface MastersFiltersCardProps {
  query: MastersPageQuery;
  setQuery: (updater: (s: MastersPageQuery) => MastersPageQuery) => void;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean | ((prev: boolean) => boolean)) => void;
  categories: MastersFilterItem[];
  cities: MastersFilterItem[];
  priceRange: { min: number; max: number };
  priceMinLocal: number;
  priceMaxLocal: number;
  clampedMinPrice: number;
  clampedMaxPrice: number;
  priceStep: number;
  thumbPrimaryClass: string;
  priceMinClamp: (v: number) => number;
  priceMaxClamp: (v: number) => number;
  setPriceMinLocal: (v: number | ((prev: number) => number)) => void;
  setPriceMaxLocal: (v: number | ((prev: number) => number)) => void;
  getCategoryLabel: (c: MastersFilterItem) => string;
  getCityLabel: (c: MastersFilterItem) => string;
  getCategoryValue: (c: MastersFilterItem) => string;
  getCityValue: (c: MastersFilterItem) => string;
  availableNowCount: number;
  hasPromotionCount: number;
  filters: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    refetch: () => void;
  };
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onResetFilters?: () => void;
  activeFilterCount?: number;
}

const filterPanelCls = cn('rounded-none border shadow-none', surfaceCardCls);
const filterInputCls =
  'rounded-none border-[#e8e8e8] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] focus:border-primary/30 shadow-none';
const searchInputCls = cn(
  filterInputCls,
  'bg-white dark:bg-[#1a1a1a] focus-visible:ring-0 focus-visible:border-primary/40',
);
const filterRowCls = 'px-3 py-2.5';

function MastersSidebarViewControls({
  viewMode,
  onViewModeChange,
  onResetFilters,
  activeFilterCount,
  className,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn(filterRowCls, 'space-y-2', className)}>
      <div className="grid grid-cols-2 border border-[#e8e8e8] dark:border-[#2d2d2d]">
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors',
            viewMode === 'list'
              ? 'bg-[hsl(var(--button-bg))] text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="h-3.5 w-3.5 shrink-0" />
          {t('masters.listView')}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('map')}
          className={cn(
            'flex items-center justify-center gap-1.5 border-l border-[#e8e8e8] dark:border-[#2d2d2d] py-2 text-xs font-semibold transition-colors',
            viewMode === 'map'
              ? 'bg-[hsl(var(--button-bg))] text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Map className="h-3.5 w-3.5 shrink-0" />
          {t('masters.mapView')}
        </button>
      </div>
      <button
        type="button"
        onClick={onResetFilters}
        className="flex w-full items-center justify-center gap-1.5 border border-[#e8e8e8] dark:border-[#2d2d2d] py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-primary" />
        {t('common.reset')}
        {activeFilterCount > 0 ? (
          <span className="inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function MastersFiltersCard({
  query,
  setQuery,
  showAdvanced,
  setShowAdvanced,
  categories,
  cities,
  priceRange,
  priceMinLocal,
  priceMaxLocal,
  clampedMinPrice,
  clampedMaxPrice,
  priceStep,
  thumbPrimaryClass,
  priceMinClamp,
  priceMaxClamp,
  setPriceMinLocal,
  setPriceMaxLocal,
  getCategoryLabel,
  getCityLabel,
  getCategoryValue,
  getCityValue,
  availableNowCount,
  hasPromotionCount,
  filters,
  section = 'all',
  viewMode = 'list',
  onViewModeChange,
  onResetFilters,
  activeFilterCount = 0,
}: MastersFiltersCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showTop = section === 'top' || section === 'all';
  const showSidebar = section === 'sidebar' || section === 'all';

  const handleSuggestionSelect = useCallback(
    (event: SearchSuggestionEvent) => {
      if (event.type === 'category' && event.category) {
        setQuery((s) => ({
          ...s,
          page: 1,
          q: '',
          categoryValue: event.category!.slug,
        }));
      } else if (event.type === 'master' && event.master) {
        navigate(`/masters/${event.master.slug}`);
      } else if (event.type === 'service' && event.service) {
        setQuery((s) => ({
          ...s,
          page: 1,
          q: event.service!.title,
          categoryValue: event.service!.categorySlug ?? s.categoryValue,
        }));
      } else {
        setQuery((s) => ({ ...s, page: 1, q: event.value }));
      }
    },
    [setQuery, navigate],
  );

  if (filters.isError) {
    return (
      <div className={cn(filterPanelCls, showTop ? 'mb-2' : '')}>
        <div className="p-3">
          <ErrorState error={filters.error} onRetry={filters.refetch} />
        </div>
      </div>
    );
  }

  if (showTop && !showSidebar) {
    return (
      <div className={cn(filterPanelCls, 'mb-2')}>
        <div className="p-3 sm:p-4">
          {onViewModeChange && onResetFilters ? (
            <MastersSidebarViewControls
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              onResetFilters={onResetFilters}
              activeFilterCount={activeFilterCount}
              className="px-0 lg:hidden"
            />
          ) : null}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground sm:text-base">
              {t('masters.searchAndFilters')}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="masters-search" className="text-xs">
                {t('masters.search')}
              </Label>
              <SearchInputWithHistory
                id="masters-search"
                value={query.q}
                onChange={(v) => setQuery((s) => ({ ...s, page: 1, q: v }))}
                onSuggestionSelect={handleSuggestionSelect}
                placeholder={t('masters.searchPlaceholder')}
                variant="default"
                cityId={query.cityValue || undefined}
                inputClassName={searchInputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('masters.category')}</Label>
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
                <SelectTrigger className={cn('w-full', filterInputCls)}>
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id ?? c.slug ?? c.name} value={getCategoryValue(c)}>
                      {getCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('masters.city')}</Label>
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
                <SelectTrigger className={cn('w-full', filterInputCls)}>
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c.id ?? c.slug ?? c.name} value={getCityValue(c)}>
                      {getCityLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSidebar && !showTop) {
    return (
      <div className={cn(filterPanelCls, 'divide-y divide-[#e8e8e8] dark:divide-[#2d2d2d]')}>
        {onViewModeChange && onResetFilters ? (
          <div className="hidden lg:block">
            <MastersSidebarViewControls
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              onResetFilters={onResetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        ) : null}

        <div className={cn(filterRowCls, 'space-y-1.5')}>
          <Label className="text-xs">{t('masters.sortBy')}</Label>
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
            <SelectTrigger className={cn('w-full', filterInputCls)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('masters.sortDefault')}</SelectItem>
              <SelectItem value="createdAt">{t('masters.sortNewest')}</SelectItem>
              <SelectItem value="rating">{t('masters.sortRating')}</SelectItem>
              <SelectItem value="price">{t('masters.sortPrice')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <MastersAdvancedFilters
          query={query}
          priceRange={priceRange}
          priceMinLocal={priceMinLocal}
          priceMaxLocal={priceMaxLocal}
          clampedMinPrice={clampedMinPrice}
          clampedMaxPrice={clampedMaxPrice}
          priceStep={priceStep}
          thumbPrimaryClass={thumbPrimaryClass}
          priceMinClamp={priceMinClamp}
          priceMaxClamp={priceMaxClamp}
          availableNowCount={availableNowCount}
          hasPromotionCount={hasPromotionCount}
          onQueryChange={setQuery}
          onPriceMinLocalChange={setPriceMinLocal}
          onPriceMaxLocalChange={setPriceMaxLocal}
          compact
        />
      </div>
    );
  }

  return (
    <div className={cn(filterPanelCls, 'mb-2')}>
      <div className="p-3 sm:p-4">
        {showTop && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                {t('masters.searchAndFilters')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 lg:col-span-2">
                <Label htmlFor="masters-search-all" className="text-xs">
                  {t('masters.search')}
                </Label>
                <SearchInputWithHistory
                  id="masters-search-all"
                  value={query.q}
                  onChange={(v) => setQuery((s) => ({ ...s, page: 1, q: v }))}
                  onSuggestionSelect={handleSuggestionSelect}
                  placeholder={t('masters.searchPlaceholder')}
                  variant="default"
                  cityId={query.cityValue || undefined}
                  inputClassName={searchInputCls}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('masters.category')}</Label>
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
                  <SelectTrigger className={cn('w-full', filterInputCls)}>
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id ?? c.slug ?? c.name} value={getCategoryValue(c)}>
                        {getCategoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('masters.city')}</Label>
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
                  <SelectTrigger className={cn('w-full', filterInputCls)}>
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c.id ?? c.slug ?? c.name} value={getCityValue(c)}>
                        {getCityLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {showSidebar && (
          <>
            <div className={cn(showTop ? 'mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2' : 'space-y-2')}>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('masters.sortBy')}</Label>
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
                  <SelectTrigger className={cn('w-full', filterInputCls)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('masters.sortDefault')}</SelectItem>
                    <SelectItem value="createdAt">{t('masters.sortNewest')}</SelectItem>
                    <SelectItem value="rating">{t('masters.sortRating')}</SelectItem>
                    <SelectItem value="price">{t('masters.sortPrice')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {section !== 'sidebar' && (
                <div className={showTop ? 'flex items-end' : ''}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="h-9 w-full justify-center gap-2 rounded-none text-primary hover:bg-primary/10 sm:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('masters.advancedFilters')}
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>

            {(section === 'sidebar' || showAdvanced) && (
              <MastersAdvancedFilters
                query={query}
                priceRange={priceRange}
                priceMinLocal={priceMinLocal}
                priceMaxLocal={priceMaxLocal}
                clampedMinPrice={clampedMinPrice}
                clampedMaxPrice={clampedMaxPrice}
                priceStep={priceStep}
                thumbPrimaryClass={thumbPrimaryClass}
                priceMinClamp={priceMinClamp}
                priceMaxClamp={priceMaxClamp}
                availableNowCount={availableNowCount}
                hasPromotionCount={hasPromotionCount}
                onQueryChange={setQuery}
                onPriceMinLocalChange={setPriceMinLocal}
                onPriceMaxLocalChange={setPriceMaxLocal}
                compact={section === 'sidebar'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
