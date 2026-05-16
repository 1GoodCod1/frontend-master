import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ApplicationPaymentType } from '@/types';

interface JobApplyPaymentApproachProps {
  value: ApplicationPaymentType;
  onChange: (val: ApplicationPaymentType) => void;
}

export function JobApplyPaymentApproach({ value, onChange }: JobApplyPaymentApproachProps) {
  const { t } = useTranslation();

  const options = [
    { value: 'FULL' as const, label: t('jobs.fullPayment'), hint: t('jobs.fullPaymentHint') },
    { value: 'PARTIAL' as const, label: t('jobs.partialPayment'), hint: t('jobs.partialPaymentHint') },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{t('jobs.paymentApproach')}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all',
              value === opt.value
                ? 'border-amber-500/40 bg-amber-500/5 shadow-sm'
                : 'border-black/5 dark:border-white/5 hover:border-amber-500/20',
            )}
          >
            <span className="text-xs font-semibold text-foreground">{opt.label}</span>
            <span className="text-[11px] text-muted-foreground">{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
