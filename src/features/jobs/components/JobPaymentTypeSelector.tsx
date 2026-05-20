import { useTranslation } from 'react-i18next';
import { DollarSign, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  clientChoiceCardCls,
  clientFormLabelCls,
  clientIconWrapCls,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';
import type { JobType } from '@/types';

interface JobPaymentTypeSelectorProps {
  value: JobType;
  onChange: (type: JobType) => void;
}

export function JobPaymentTypeSelector({ value, onChange }: JobPaymentTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label className={clientFormLabelCls}>{t('jobs.type', 'Payment Type')}</Label>
      <div className="grid grid-cols-2 gap-3">
        {(['FIXED_PRICE', 'HOURLY'] as JobType[]).map((type) => {
          const isActive = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={clientChoiceCardCls(isActive)}
            >
              <span
                className={cn(
                  clientIconWrapCls,
                  'mb-2 h-8 w-8 rounded-[10px]',
                  !isActive && 'bg-[#F1F3F5] text-[#6C757D] group-hover:bg-[#FFF8EB] group-hover:text-[#E97525] dark:bg-white/[0.06]',
                )}
              >
                {type === 'FIXED_PRICE' ? <DollarSign className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </span>
              <p className={cn('text-[13px] font-semibold', isActive ? 'text-[#E97525]' : clientTextTitle)}>
                {type === 'FIXED_PRICE'
                  ? t('jobs.fixedPrice', 'Fixed Price')
                  : t('jobs.hourlyRate', 'Hourly Rate')}
              </p>
              <p className={cn('mt-0.5', clientTextMuted)}>
                {type === 'FIXED_PRICE'
                  ? t('jobs.fixedPriceDesc', 'Set amount for the whole project')
                  : t('jobs.hourlyRateDesc', 'Pay per hour of work')}
              </p>
              {isActive && (
                <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#E97525]">
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
