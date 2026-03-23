import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
}: MastersFiltersCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  return (
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
          <ErrorState error={filters.error} onRetry={filters.refetch} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  onSuggestionSelect={handleSuggestionSelect}
                  placeholder={t('masters.searchPlaceholder')}
                  variant="default"
                  cityId={query.cityValue || undefined}
                />
              </div>

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
                    {categories.map((c) => (
                      <SelectItem key={c.id ?? c.slug ?? c.name} value={getCategoryValue(c)}>
                        {getCategoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    {cities.map((c) => (
                      <SelectItem key={c.id ?? c.slug ?? c.name} value={getCityValue(c)}>
                        {getCityLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                    <SelectItem value="all">{t('masters.sortDefault')}</SelectItem>
                    <SelectItem value="createdAt">{t('masters.sortNewest')}</SelectItem>
                    <SelectItem value="rating">{t('masters.sortRating')}</SelectItem>
                    <SelectItem value="price">{t('masters.sortPrice')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

            <AnimatePresence>
              {showAdvanced && (
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
                />
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
}
