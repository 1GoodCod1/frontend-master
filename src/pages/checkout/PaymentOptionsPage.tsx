import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Building2, ArrowLeft } from 'lucide-react';
import { usePaymentOptionsPage } from '@/hooks/payments';
import { toErrorMessage } from '@/utils/errors';
import { usePaymentsSimulateMiaSandboxMutation } from '@/features/payments/paymentsApi';
import { LoadingState } from '@/components/common/States';
import { PaymentMethodCard } from '@/features/payments/components/PaymentMethodCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PaymentOptionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [miaState, setMiaState] = useState<{ qrUrl: string; paymentId: string } | null>(null);
  const [simulateMia, { isLoading: simulateLoading }] = usePaymentsSimulateMiaSandboxMutation();
  const {
    planKey,
    planLabel,
    planPrice,
    isPendingUpgrade,
    onPayWithMia,
    miaLoading,
    isReady,
    isLoadingProfile,
  } = usePaymentOptionsPage();

  const handleMiaPay = async () => {
    const result = await onPayWithMia();
    if (result?.qrUrl) setMiaState({ qrUrl: result.qrUrl, paymentId: result.paymentId });
  };

  const handleSandboxSimulate = async () => {
    if (!miaState?.paymentId) return;
    try {
      await simulateMia({ paymentId: miaState.paymentId }).unwrap();
      toast.success(t('paymentOptions.sandboxSimulateSuccess'));
      setMiaState(null);
      navigate('/plans/checkout/success', { replace: true });
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('paymentOptions.sandboxSimulateFailed'));
    }
  };

  if (!isReady || isLoadingProfile) {
    return <LoadingState label={t('paymentOptions.loading')} />;
  }

  if (!planKey) {
    return (
      <div className="container max-w-md mx-auto py-8 md:py-12 px-4">
        <Card className="border-2 border-[#f5f4eb] dark:border-white/[0.08]">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">{t('paymentOptions.noPlan')}</p>
            <Button asChild>
              <RouterLink to="/plans">{t('paymentOptions.backToPlans')}</RouterLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mh-page-enter container max-w-4xl mx-auto py-6 md:py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" size="sm" asChild className="self-start">
            <RouterLink to="/plans" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('paymentOptions.backToPlans')}
            </RouterLink>
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-slate-100">
            {t('paymentOptions.title')}
          </h1>
          <p className="text-muted-foreground dark:text-slate-400 mt-1">
            {t('paymentOptions.subtitle')}
          </p>
        </div>

        <Card className="border-2 border-[#f5f4eb] dark:border-white/[0.08]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {t('paymentOptions.selectedPlan')}
            </p>
            <p className="text-xl font-bold text-foreground mt-1">
              {planLabel}
              {planPrice && (
                <span className="text-muted-foreground font-normal ml-2">— {planPrice}</span>
              )}
            </p>
            {isPendingUpgrade && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                {t('plans.pendingUpgradeTitle')}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PaymentMethodCard
            icon={<Wallet className="h-5 w-5" />}
            title={t('paymentOptions.mia.title')}
            description={t('paymentOptions.mia.description')}
            hint={t('paymentOptions.mia.sandboxHint')}
            buttonLabel={t('paymentOptions.pay')}
            loadingLabel={t('paymentOptions.loading')}
            disabled={isPendingUpgrade}
            loading={miaLoading}
            onClick={isPendingUpgrade ? undefined : handleMiaPay}
          />
          <PaymentMethodCard
            icon={<Building2 className="h-5 w-5" />}
            title={t('paymentOptions.moldindcombank.title')}
            description={t('paymentOptions.moldindcombank.description')}
            buttonLabel={t('paymentOptions.comingSoon')}
            disabled
          />
          <PaymentMethodCard
            icon={<Building2 className="h-5 w-5" />}
            title={t('paymentOptions.agroindbank.title')}
            description={t('paymentOptions.agroindbank.description')}
            buttonLabel={t('paymentOptions.comingSoon')}
            disabled
          />
        </div>
      </div>

      <Dialog open={Boolean(miaState)} onOpenChange={(open) => !open && setMiaState(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('paymentOptions.mia.title')}</DialogTitle>
          </DialogHeader>
          {miaState && (
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm text-muted-foreground text-center">
                {t('paymentOptions.mia.scanWithMia')}
              </p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(miaState.qrUrl)}`}
                alt="QR code for MIA payment"
                className="rounded-lg border border-border"
                width={200}
                height={200}
              />
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={miaState.qrUrl} target="_blank" rel="noopener noreferrer">
                  {t('paymentOptions.mia.openLink')}
                </a>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={simulateLoading}
                onClick={handleSandboxSimulate}
              >
                {simulateLoading ? t('paymentOptions.loading') : t('paymentOptions.sandboxSimulate')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
