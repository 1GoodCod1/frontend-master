import { useTranslation } from 'react-i18next';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeatureValue = boolean | string;

interface FeatureRow {
  labelKey: string;
  values: [FeatureValue, FeatureValue, FeatureValue];
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    labelKey: 'plans.comparisonTable.publicProfile',
    values: [true, true, true],
  },
  {
    labelKey: 'plans.comparisonTable.photosCount',
    values: ['5', '10', '15'],
  },
  {
    labelKey: 'plans.comparisonTable.receiveLeads',
    values: [true, true, true],
  },
  { labelKey: 'plans.comparisonTable.reviews', values: [true, true, true] },
  {
    labelKey: 'plans.comparisonTable.analytics',
    values: ['basic', 'basic', 'advanced'],
  },
  { labelKey: 'plans.comparisonTable.vipBadge', values: [false, true, true] },
  {
    labelKey: 'plans.comparisonTable.higherInSearch',
    values: [false, true, true],
  },
  {
    labelKey: 'plans.comparisonTable.telegramWhatsapp',
    values: [false, true, true],
  },
  {
    labelKey: 'plans.comparisonTable.topPositions',
    values: [false, false, true],
  },
  {
    labelKey: 'plans.comparisonTable.portfolio',
    values: [false, true, true],
  },
  { labelKey: 'plans.comparisonTable.autoBoost', values: [false, false, true] },
  {
    labelKey: 'plans.comparisonTable.availabilityStatus',
    values: [false, false, true],
  },
  {
    labelKey: 'plans.comparisonTable.exportLeads',
    values: [false, false, true],
  },
  {
    labelKey: 'plans.comparisonTable.servicePromotions',
    values: [false, false, true],
  },
];

const PLAN_COLORS = ['gray', 'orange', 'teal'] as const;

function FeatureCell({
  value,
  planColor,
}: {
  value: FeatureValue;
  planColor: (typeof PLAN_COLORS)[number];
}) {
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus className="h-4 w-4 text-gray-800 dark:text-zinc-500" />
      </div>
    );
  }
  if (value === true) {
    return (
      <div className="flex justify-center">
        <span
          className={cn(
            'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
            'bg-gray-100 border border-gray-300 text-gray-600',
            'dark:bg-gray-500 dark:border-transparent dark:text-white',
            planColor === 'orange' &&
              'bg-orange-100 border border-orange-600 text-orange-700 dark:bg-orange-500 dark:border-transparent dark:text-white',
            planColor === 'teal' &&
              'bg-teal-100 border border-teal-600 text-teal-800 dark:bg-teal-500 dark:border-transparent dark:text-white'
          )}
        >
          <Check
            className={cn(
              'h-3.5 w-3.5',
              planColor === 'gray' && 'text-gray-600 dark:text-white',
              planColor === 'orange' && 'text-orange-700 dark:text-white',
              planColor === 'teal' && 'text-teal-800 dark:text-white'
            )}
            strokeWidth={2.5}
          />
        </span>
      </div>
    );
  }
  if (planColor === 'gray') {
    return (
      <div className="flex justify-center">
        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span
        className={cn(
          'inline-flex min-w-[2rem] items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium',
          planColor === 'orange' &&
            'bg-orange-100 border border-orange-600 text-orange-700 dark:bg-orange-500 dark:border-transparent dark:text-white',
          planColor === 'teal' &&
            'bg-teal-100 border border-teal-600 text-teal-800 dark:bg-teal-500 dark:border-transparent dark:text-white'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PlansComparisonTable() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/95 overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto overscroll-x-contain">
        <div className="min-w-[320px] sm:min-w-0">
      <div className="grid grid-cols-[minmax(140px,1fr)_repeat(3,minmax(80px,100px))] sm:grid-cols-[1fr_repeat(3,_100px)] border-b border-gray-200 dark:border-zinc-800">
        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          {t('plans.comparisonTable.featureLabel')}
        </div>
        {(['basic', 'vip', 'premium'] as const).map((plan) => (
          <div
            key={plan}
            className={cn(
              'py-3 text-center text-xs font-bold text-gray-900 dark:text-white',
              plan === 'basic' && 'dark:text-zinc-400',
              plan === 'vip' && 'text-orange-600 dark:text-orange-400',
              plan === 'premium' && 'text-teal-700 dark:text-teal-400'
            )}
          >
            {t(`plans.${plan}.name`)}
          </div>
        ))}
      </div>

      {FEATURE_ROWS.map((row, i) => (
        <div
          key={row.labelKey}
          className={cn(
            'grid grid-cols-[minmax(140px,1fr)_repeat(3,minmax(80px,100px))] sm:grid-cols-[1fr_repeat(3,_100px)] border-b last:border-b-0 border-gray-200 dark:border-zinc-800',
            i % 2 === 0 && 'bg-gray-50/80 dark:bg-zinc-800/50'
          )}
        >
          <div className="px-5 py-3 text-sm text-gray-900 dark:text-white min-w-0">
            {t(row.labelKey)}
          </div>
          {row.values.map((val, j) => {
            const displayVal =
              typeof val === 'string' && (val === 'basic' || val === 'advanced')
                ? val
                : val;
            return (
              <div key={j} className="py-3 flex items-center justify-center">
                {typeof displayVal === 'string' &&
                (displayVal === 'basic' || displayVal === 'advanced') ? (
                  PLAN_COLORS[j] === 'gray' ? (
                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                        {t(`plans.comparisonTable.${displayVal}Value`)}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex min-w-[4rem] items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium',
                        PLAN_COLORS[j] === 'orange' &&
                          'bg-orange-100 border border-orange-600 text-orange-700 dark:bg-orange-500 dark:border-transparent dark:text-white',
                        PLAN_COLORS[j] === 'teal' &&
                          'bg-teal-100 border border-teal-600 text-teal-800 dark:bg-teal-500 dark:border-transparent dark:text-white'
                      )}
                    >
                      {t(`plans.comparisonTable.${displayVal}Value`)}
                    </span>
                  )
                ) : (
                  <FeatureCell value={displayVal} planColor={PLAN_COLORS[j]} />
                )}
              </div>
            );
          })}
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}
