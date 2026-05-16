import { useTranslation } from 'react-i18next';
import { DollarSign, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { JobType } from '@/types';

interface JobPaymentTypeSelectorProps {
  value: JobType;
  onChange: (type: JobType) => void;
}

export function JobPaymentTypeSelector({ value, onChange }: JobPaymentTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">
        {t('jobs.type', 'Payment Type')}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {(['FIXED_PRICE', 'HOURLY'] as JobType[]).map((type) => {
          const isActive = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200',
                isActive
                  ? 'border-amber-500 bg-amber-500/8 shadow-md shadow-amber-500/10'
                  : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-sm',
              )}
            >
              <div className={cn(
                'mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                isActive ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-500',
              )}>
                {type === 'FIXED_PRICE'
                  ? <DollarSign className="h-4 w-4" />
                  : <Clock className="h-4 w-4" />}
              </div>
              <p className={cn(
                'text-sm font-semibold transition-colors',
                isActive ? 'text-amber-600 dark:text-amber-400' : 'text-foreground',
              )}>
                {type === 'FIXED_PRICE'
                  ? t('jobs.fixedPrice', 'Fixed Price')
                  : t('jobs.hourlyRate', 'Hourly Rate')}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {type === 'FIXED_PRICE'
                  ? t('jobs.fixedPriceDesc', 'Set amount for the whole project')
                  : t('jobs.hourlyRateDesc', 'Pay per hour of work')}
              </p>
              {isActive && (
                <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
