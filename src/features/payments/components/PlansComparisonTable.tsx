import { useTranslation } from 'react-i18next';
import { Check, Minus } from 'lucide-react';
import { JointsBadge } from '@/components/joints';
import {
  comparisonCheckCls,
  comparisonHeaderCellCls,
  comparisonLabelCls,
  comparisonPlanHeaderCls,
  comparisonRowCls,
  comparisonTableCls,
  comparisonValuePillCls,
} from '@/features/payments/planStyles';

type FeatureValue = boolean | string;
type PlanColor = 'gray' | 'orange' | 'premium';

interface FeatureRow {
  labelKey: string;
  values: [FeatureValue, FeatureValue, FeatureValue];
  joints?: boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  { labelKey: 'plans.comparisonTable.publicProfile', values: [true, true, true] },
  { labelKey: 'plans.comparisonTable.photosCount', values: ['5', '10', '15'] },
  { labelKey: 'plans.comparisonTable.jointsPerMonth', values: ['20', '100', '200'], joints: true },
  { labelKey: 'plans.comparisonTable.receiveLeads', values: [true, true, true] },
  { labelKey: 'plans.comparisonTable.reviews', values: [true, true, true] },
  { labelKey: 'plans.comparisonTable.analytics', values: ['basic', 'basic', 'advanced'] },
  { labelKey: 'plans.comparisonTable.vipBadge', values: [false, true, true] },
  { labelKey: 'plans.comparisonTable.higherInSearch', values: [false, true, true] },
  { labelKey: 'plans.comparisonTable.telegramWhatsapp', values: [false, true, true] },
  { labelKey: 'plans.comparisonTable.topPositions', values: [false, false, true] },
  { labelKey: 'plans.comparisonTable.portfolio', values: [false, true, true] },
  { labelKey: 'plans.comparisonTable.autoBoost', values: [false, false, true] },
  { labelKey: 'plans.comparisonTable.availabilityStatus', values: [false, false, true] },
  { labelKey: 'plans.comparisonTable.exportLeads', values: [false, false, true] },
  { labelKey: 'plans.comparisonTable.servicePromotions', values: [false, false, true] },
];

const PLAN_COLORS: PlanColor[] = ['gray', 'orange', 'premium'];

function FeatureCell({
  value,
  planColor,
  joints,
}: {
  value: FeatureValue;
  planColor: PlanColor;
  joints?: boolean;
}) {
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus className="size-4 text-[#ADB5BD] dark:text-white/35" />
      </div>
    );
  }
  if (value === true) {
    return (
      <div className="flex justify-center">
        <span className={comparisonCheckCls(planColor)}>
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      </div>
    );
  }
  if (joints && typeof value === 'string') {
    return (
      <div className="flex justify-center">
        <JointsBadge value={Number(value)} size="xs" />
      </div>
    );
  }
  if (planColor === 'gray') {
    return (
      <div className="flex justify-center">
        <span className="text-[13px] font-medium text-[#495057] dark:text-white/70">{value}</span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className={comparisonValuePillCls(planColor)}>{value}</span>
    </div>
  );
}

export function PlansComparisonTable() {
  const { t } = useTranslation();

  return (
    <div className={comparisonTableCls}>
      <div className="overflow-x-auto overscroll-x-contain">
        <div className="min-w-[320px] sm:min-w-0">
          <div className="grid grid-cols-[minmax(140px,1fr)_repeat(3,minmax(80px,100px))] border-b border-[#E9ECEF] dark:border-white/10 sm:grid-cols-[1fr_repeat(3,_100px)]">
            <div className={comparisonHeaderCellCls}>{t('plans.comparisonTable.featureLabel')}</div>
            {(['basic', 'vip', 'premium'] as const).map((plan) => (
              <div key={plan} className={comparisonPlanHeaderCls(plan)}>
                {t(`plans.${plan}.name`)}
              </div>
            ))}
          </div>

          {FEATURE_ROWS.map((row, i) => (
            <div key={row.labelKey} className={comparisonRowCls(i % 2 === 0)}>
              <div className={comparisonLabelCls}>{t(row.labelKey)}</div>
              {row.values.map((val, j) => {
                const displayVal =
                  typeof val === 'string' && (val === 'basic' || val === 'advanced') ? val : val;
                return (
                  <div key={j} className="flex items-center justify-center py-3">
                    {typeof displayVal === 'string' &&
                    (displayVal === 'basic' || displayVal === 'advanced') ? (
                      PLAN_COLORS[j] === 'gray' ? (
                        <span className="text-[13px] font-medium text-[#495057] dark:text-white/70">
                          {t(`plans.comparisonTable.${displayVal}Value`)}
                        </span>
                      ) : (
                        <span className={comparisonValuePillCls(PLAN_COLORS[j])}>
                          {t(`plans.comparisonTable.${displayVal}Value`)}
                        </span>
                      )
                    ) : (
                      <FeatureCell value={displayVal} planColor={PLAN_COLORS[j]} joints={row.joints} />
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
