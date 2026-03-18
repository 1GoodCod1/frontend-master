import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface MastersPriceRangeFilterProps {
  priceRange: { min: number; max: number };
  priceMinLocal: number;
  priceMaxLocal: number;
  clampedMinPrice: number;
  clampedMaxPrice: number;
  priceStep: number;
  thumbPrimaryClass: string;
  priceMinClamp: (v: number) => number;
  priceMaxClamp: (v: number) => number;
  onMinChange: (v: number) => void;
  onMinCommit: (v: number) => void;
  onMaxChange: (v: number) => void;
  onMaxCommit: (v: number) => void;
  onMinInputChange: (v: number) => void;
  onMaxInputChange: (v: number) => void;
}

export function MastersPriceRangeFilter({
  priceRange,
  priceMinLocal,
  priceMaxLocal,
  clampedMinPrice,
  clampedMaxPrice,
  priceStep,
  thumbPrimaryClass,
  priceMinClamp,
  priceMaxClamp,
  onMinChange,
  onMinCommit,
  onMaxChange,
  onMaxCommit,
  onMinInputChange,
  onMaxInputChange,
}: MastersPriceRangeFilterProps) {
  const { t } = useTranslation();

  return (
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
            {clampedMinPrice} – {clampedMaxPrice} {t('masters.currency')}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs font-medium text-foreground">
              {t('masters.priceMin')}
            </Label>
            <span className="text-sm font-semibold tabular-nums text-primary">
              {priceMinClamp(Math.min(priceMinLocal, priceMaxLocal))}{' '}
              {t('masters.currency')}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-0 [&_.relative]:!h-2.5 [&_.relative]:!rounded-full [&_.relative>:first-child]:!bg-primary dark:[&_.relative>:first-child]:!bg-[#E97525]">
              <Slider
                value={[priceMinClamp(Math.min(priceMinLocal, priceMaxLocal))]}
                onValueChange={([v]) =>
                  onMinChange(priceMinClamp(Math.min(v, priceMaxLocal)))
                }
                onValueCommit={([v]) => onMinCommit(v)}
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
                onMinInputChange(num);
              }}
              className="h-8 w-20 text-sm border-gray-200 dark:border-white/10 bg-background shrink-0"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs font-medium text-foreground">
              {t('masters.priceMax')}
            </Label>
            <span className="text-sm font-semibold tabular-nums text-primary">
              {priceMaxClamp(Math.max(priceMaxLocal, priceMinLocal))}{' '}
              {t('masters.currency')}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-0 [&_.relative]:!h-2.5 [&_.relative]:!rounded-full [&_.relative>:first-child]:!bg-primary dark:[&_.relative>:first-child]:!bg-[#E97525]">
              <Slider
                value={[priceMaxClamp(Math.max(priceMaxLocal, priceMinLocal))]}
                onValueChange={([v]) =>
                  onMaxChange(priceMaxClamp(Math.max(v, priceMinLocal)))
                }
                onValueCommit={([v]) => onMaxCommit(v)}
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
                onMaxInputChange(num);
              }}
              className="h-8 w-20 text-sm border-gray-200 dark:border-white/10 bg-background shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
