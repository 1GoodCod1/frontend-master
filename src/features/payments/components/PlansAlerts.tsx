import { useTranslation } from 'react-i18next';
import { TariffPlan } from '@/features/auth/plan';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col gap-4">
      {pendingUpgrade && (
        <Alert className="rounded-lg border-[#f5f4eb] dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-900/20 text-foreground dark:text-slate-100">
          <AlertDescription className="flex flex-col gap-3">
            <span className="text-sm">
              <strong>{t('plans.pendingUpgradeTitle')}:</strong>{' '}
              {t('plans.pendingUpgradeMessage', {
                tariff: pendingUpgrade.to,
                hours: Math.ceil(pendingUpgrade.hoursRemaining ?? 0),
              })}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                disabled={confirmLoading}
                onClick={onConfirmUpgrade}
              >
                {t('plans.confirmUpgrade')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={cancelLoading}
                onClick={onCancelUpgrade}
              >
                {t('plans.cancelUpgrade')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isExpired && effectivePlan === 'BASIC' && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription className="text-sm">
            {t('plans.tariffExpired')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
