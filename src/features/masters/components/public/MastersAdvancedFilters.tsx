import { useTranslation } from 'react-i18next';
import { CircleDot, Tag, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MastersPriceRangeFilter } from './MastersPriceRangeFilter';
import type { MastersPageQuery } from '@/features/masters/hooks/useMastersPage';

interface MastersAdvancedFiltersProps {
  query: MastersPageQuery;
  priceRange: { min: number; max: number };
  priceMinLocal: number;
  priceMaxLocal: number;
  clampedMinPrice: number;
  clampedMaxPrice: number;
  priceStep: number;
  thumbPrimaryClass: string;
  priceMinClamp: (v: number) => number;
  priceMaxClamp: (v: number) => number;
  availableNowCount: number;
  hasPromotionCount: number;
  onQueryChange: (updater: (s: MastersPageQuery) => MastersPageQuery) => void;
  onPriceMinLocalChange: (v: number) => void;
  onPriceMaxLocalChange: (v: number) => void;
  /** Compact (sidebar) layout — single column, smaller cards */
  compact?: boolean;
}

export function MastersAdvancedFilters({
  query,
  priceRange,
  priceMinLocal,
  priceMaxLocal,
  clampedMinPrice,
  clampedMaxPrice,
  priceStep,
  thumbPrimaryClass,
  priceMinClamp,
  priceMaxClamp,
  availableNowCount,
  hasPromotionCount,
  onQueryChange,
  onPriceMinLocalChange,
  onPriceMaxLocalChange,
  compact = false,
}: MastersAdvancedFiltersProps) {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.08] space-y-2.5">
        {/* Available now */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 dark:bg-secondary/25 px-2.5 py-2 border border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <CircleDot className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {t('masters.availableNow')}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {availableNowCount}
              </p>
            </div>
          </div>
          <Switch
            size="default"
            variant="green"
            checked={query.availableNow}
            onCheckedChange={(checked) =>
              onQueryChange((s) => ({ ...s, page: 1, availableNow: checked }))
            }
          />
        </div>

        {/* With promotion */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 dark:bg-secondary/25 px-2.5 py-2 border border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {t('masters.withPromotion')}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {hasPromotionCount}
              </p>
            </div>
          </div>
          <Switch
            size="default"
            variant="rose"
            checked={query.hasPromotion}
            onCheckedChange={(checked) =>
              onQueryChange((s) => ({ ...s, page: 1, hasPromotion: checked }))
            }
          />
        </div>

        {/* Min rating */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 dark:bg-secondary/25 px-2.5 py-2 border border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <Star className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-semibold text-foreground truncate">
              {t('masters.minRating')}
            </p>
          </div>
          <Select
            value={String(query.minRating)}
            onValueChange={(v) =>
              onQueryChange((s) => ({ ...s, page: 1, minRating: Number(v) }))
            }
          >
            <SelectTrigger className="h-8 w-20 text-xs border-gray-200 dark:border-white/10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('common.all')}</SelectItem>
              <SelectItem value="3">3.0+</SelectItem>
              <SelectItem value="3.5">3.5+</SelectItem>
              <SelectItem value="4">4.0+</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
              <SelectItem value="4.8">4.8+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price range */}
        <MastersPriceRangeFilter
          priceRange={priceRange}
          priceMinLocal={priceMinLocal}
          priceMaxLocal={priceMaxLocal}
          clampedMinPrice={clampedMinPrice}
          clampedMaxPrice={clampedMaxPrice}
          priceStep={priceStep}
          thumbPrimaryClass={thumbPrimaryClass}
          priceMinClamp={priceMinClamp}
          priceMaxClamp={priceMaxClamp}
          onMinChange={(v) => onPriceMinLocalChange(v)}
          onMinCommit={(v) =>
            onQueryChange((s) => ({
              ...s,
              page: 1,
              minPrice: priceMinClamp(Math.min(v, s.maxPrice)),
            }))
          }
          onMaxChange={(v) => onPriceMaxLocalChange(v)}
          onMaxCommit={(v) =>
            onQueryChange((s) => ({
              ...s,
              page: 1,
              maxPrice: priceMaxClamp(Math.max(v, s.minPrice)),
            }))
          }
          onMinInputChange={(v) => {
            const clamped = priceMinClamp(Math.min(v, query.maxPrice));
            onPriceMinLocalChange(clamped);
            onQueryChange((s) => ({ ...s, page: 1, minPrice: clamped }));
          }}
          onMaxInputChange={(v) => {
            const clamped = priceMaxClamp(Math.max(v, query.minPrice));
            onPriceMaxLocalChange(clamped);
            onQueryChange((s) => ({ ...s, page: 1, maxPrice: clamped }));
          }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200 dark:border-white/[0.08]">
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
                {t('masters.availableNowHint')} ({availableNowCount})
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
                onQueryChange((s) => ({
                  ...s,
                  page: 1,
                  availableNow: checked,
                }))
              }
            />
          </div>
        </div>

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
                {t('masters.withPromotionHint')} ({hasPromotionCount})
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
                onQueryChange((s) => ({
                  ...s,
                  page: 1,
                  hasPromotion: checked,
                }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-secondary/60 dark:bg-secondary/30 px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-500/15 dark:bg-amber-400/15">
              <Star className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('masters.minRating')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('masters.minRatingHint')}
              </p>
            </div>
          </div>
          <Select
            value={String(query.minRating)}
            onValueChange={(v) =>
              onQueryChange((s) => ({
                ...s,
                page: 1,
                minRating: Number(v),
              }))
            }
          >
            <SelectTrigger className="w-28 border-gray-200 dark:border-white/10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('common.all')}</SelectItem>
              <SelectItem value="3">3.0+</SelectItem>
              <SelectItem value="3.5">3.5+</SelectItem>
              <SelectItem value="4">4.0+</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
              <SelectItem value="4.8">4.8+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <MastersPriceRangeFilter
          priceRange={priceRange}
          priceMinLocal={priceMinLocal}
          priceMaxLocal={priceMaxLocal}
          clampedMinPrice={clampedMinPrice}
          clampedMaxPrice={clampedMaxPrice}
          priceStep={priceStep}
          thumbPrimaryClass={thumbPrimaryClass}
          priceMinClamp={priceMinClamp}
          priceMaxClamp={priceMaxClamp}
          onMinChange={(v) => onPriceMinLocalChange(v)}
          onMinCommit={(v) =>
            onQueryChange((s) => ({
              ...s,
              page: 1,
              minPrice: priceMinClamp(Math.min(v, s.maxPrice)),
            }))
          }
          onMaxChange={(v) => onPriceMaxLocalChange(v)}
          onMaxCommit={(v) =>
            onQueryChange((s) => ({
              ...s,
              page: 1,
              maxPrice: priceMaxClamp(Math.max(v, s.minPrice)),
            }))
          }
          onMinInputChange={(v) => {
            const clamped = priceMinClamp(Math.min(v, query.maxPrice));
            onPriceMinLocalChange(clamped);
            onQueryChange((s) => ({ ...s, page: 1, minPrice: clamped }));
          }}
          onMaxInputChange={(v) => {
            const clamped = priceMaxClamp(Math.max(v, query.minPrice));
            onPriceMaxLocalChange(clamped);
            onQueryChange((s) => ({ ...s, page: 1, maxPrice: clamped }));
          }}
        />
      </div>
    </div>
  );
}
