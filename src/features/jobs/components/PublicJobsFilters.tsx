import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

const ALL = 'all';

type PublicJobsFiltersProps = {
  cityId: string;
  categoryId: string;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
  showBestHint?: boolean;
  profileCategory?: string | null;
  profileCity?: string | null;
  className?: string;
};

export function PublicJobsFilters({
  cityId,
  categoryId,
  onCityChange,
  onCategoryChange,
  onReset,
  showBestHint,
  profileCategory,
  profileCity,
  className,
}: PublicJobsFiltersProps) {
  const { t } = useTranslation();
  const { data: filtersData, isLoading } = useMastersFiltersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
    pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
  });

  const getCityLabel = (c: { id: string; name: string; slug: string }) =>
    t(`cities.${c.slug}`, { defaultValue: c.name }) || c.name;
  const getCategoryLabel = (c: { id: string; name: string; slug: string }) =>
    t(`categories.${c.slug}`, { defaultValue: c.name }) || c.name;

  const hasActiveFilters = cityId !== ALL || categoryId !== ALL;

  const sortedCities = useMemo(
    () =>
      [...(filtersData?.cities ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    [filtersData?.cities],
  );
  const sortedCategories = useMemo(
    () =>
      [...(filtersData?.categories ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    [filtersData?.categories],
  );
  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn('rounded-2xl p-4', surfaceCardCls)}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#E97525]" aria-hidden />
            <h3 className="text-sm font-semibold text-[#212529] dark:text-white truncate">
              {t('jobs.filters.title')}
            </h3>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-[#E97525]"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              {t('jobs.filters.reset')}
            </Button>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-[#6C757D] dark:text-white/50">
              {t('jobs.filters.category')}
            </Label>
            <Select
              value={categoryId}
              onValueChange={onCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 rounded-xl bg-white dark:bg-[#1a1a1a] border-[#e8e8e8] dark:border-[#2d2d2d] text-sm">
                <SelectValue placeholder={t('jobs.filters.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('jobs.filters.allCategories')}</SelectItem>
                {sortedCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {getCategoryLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-[#6C757D] dark:text-white/50">
              {t('jobs.filters.city')}
            </Label>
            <Select value={cityId} onValueChange={onCityChange} disabled={isLoading}>
              <SelectTrigger className="h-9 rounded-xl bg-white dark:bg-[#1a1a1a] border-[#e8e8e8] dark:border-[#2d2d2d] text-sm">
                <SelectValue placeholder={t('jobs.filters.allCities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('jobs.filters.allCities')}</SelectItem>
                {sortedCities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {getCityLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {showBestHint && (profileCategory || profileCity) ? (
        <div
          className={cn(
            'rounded-2xl p-3 flex gap-2.5',
            'bg-[#E97525]/8 border border-[#E97525]/20 dark:bg-[#E97525]/10 dark:border-[#E97525]/25',
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-[#E97525] mt-0.5" aria-hidden />
          <p className="text-[11px] leading-relaxed text-[#495057] dark:text-white/65">
            {t('jobs.filters.bestHint', {
              category: profileCategory ?? t('jobs.filters.anyCategory'),
              city: profileCity ?? t('jobs.filters.anyCity'),
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
