import { useTranslation } from 'react-i18next';
import { TariffPlan } from '@/features/auth/plan';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cabinetInsetPanelCls, cabinetPrimaryBtnCls, cabinetOutlineBtnCls } from '@/lib/cabinetStyles';

interface PlansAlertsProps {
  isAuthed: boolean;
  effectivePlan: TariffPlan;
  isExpired: boolean;
  pendingUpgrade: { to: string; hoursRemaining?: number } | null;
  confirmLoading: boolean;
  cancelLoading: boolean;
  onConfirmUpgrade: () => void;
  onCancelUpgrade: () => void;
}

export const PlansAlerts = ({
  isAuthed,
  effectivePlan,
  isExpired,
  pendingUpgrade,
  confirmLoading,
  cancelLoading,
  onConfirmUpgrade,
  onCancelUpgrade,
}: PlansAlertsProps) => {
  const { t } = useTranslation();

  if (!isAuthed) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8">
      {pendingUpgrade ? (
        <div
          className={cn(
            cabinetInsetPanelCls,
            'border-[#E97525]/30 bg-[#FFF8EB]/80 dark:bg-[#E97525]/10',
          )}
        >
          <p className="text-[13px] text-[#212529] dark:text-white/90">
            <strong className="text-[#c45f1a] dark:text-[#f08540]">{t('plans.pendingUpgradeTitle')}:</strong>{' '}
            {t('plans.pendingUpgradeMessage', {
              tariff: pendingUpgrade.to,
              hours: Math.ceil(pendingUpgrade.hoursRemaining ?? 0),
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={confirmLoading}
              onClick={onConfirmUpgrade}
              className={cabinetPrimaryBtnCls}
            >
              {t('plans.confirmUpgrade')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={cancelLoading}
              onClick={onCancelUpgrade}
              className={cabinetOutlineBtnCls}
            >
              {t('plans.cancelUpgrade')}
            </Button>
          </div>
        </div>
      ) : null}

      {isExpired && effectivePlan === 'BASIC' ? (
        <div className="rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive dark:bg-destructive/10">
          {t('plans.tariffExpired')}
        </div>
      ) : null}
    </div>
  );
};
