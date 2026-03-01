import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectRole } from '@/features/auth/selectors';
import { usePlansLogic } from '@/hooks/payments/usePlansLogic';
import { LoadingState } from '@/components/common/States';
import { PlanCard } from '@/components/payments/PlanCard';
import { PlansAlerts } from '@/components/payments/PlansAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function PlansPage() {
  const { t } = useTranslation();
  const role = useAppSelector(selectRole);

  const {
    isAuthed,
    isClient,
    isMaster,
    isVerified,
    effectivePlan,
    isExpired,
    pendingUpgrade,
    lifetimePremium,
    plansToShow,
    isLoading,
    checkoutLoading,
    claimLoading,
    confirmLoading,
    cancelLoading,
    onBuy,
    onConfirmPendingUpgrade,
    onCancelPendingUpgrade,
  } = usePlansLogic();
  const pendingUpgradeSafe: { to: string; hoursRemaining?: number } | null =
    isRecord(pendingUpgrade) && typeof pendingUpgrade.to === 'string'
      ? {
          to: pendingUpgrade.to,
          hoursRemaining:
            typeof pendingUpgrade.hoursRemaining === 'number'
              ? pendingUpgrade.hoursRemaining
              : undefined,
        }
      : null;

  if (role === 'ADMIN') {
    return (
      <div className="container max-w-md mx-auto py-8 md:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border text-center overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('plans.adminView.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('plans.adminView.subtitle')}
              </p>
              <Button asChild size="lg">
                <RouterLink to="/admin/tariffs">{t('plans.adminView.goToAdmin')}</RouterLink>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isClient) {
    return (
      <div className="container max-w-2xl mx-auto py-8 md:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border text-center overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('plans.becomeMaster.title')}
              </h2>
              <p className="text-base font-medium text-primary mb-4">
                {t('plans.becomeMaster.comingSoon')}
              </p>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                {t('plans.becomeMaster.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" asChild>
                  <RouterLink to="/">{t('common.back')}</RouterLink>
                </Button>
                <Button asChild>
                  <RouterLink to="/masters">{t('plans.becomeMaster.browseMasters')}</RouterLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState label={t('plans.loading')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-5xl mx-auto py-8 md:py-12 px-4"
    >
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {isMaster ? t('plans.myPlan') : t('plans.title')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isMaster ? t('plans.myPlanSubtitle') : t('plans.subtitle')}
          </p>
        </div>

        <PlansAlerts
          isAuthed={isAuthed}
          effectivePlan={effectivePlan}
          isExpired={isExpired}
          pendingUpgrade={pendingUpgradeSafe}
          lifetimePremium={lifetimePremium}
          confirmLoading={confirmLoading}
          cancelLoading={cancelLoading}
          onConfirmUpgrade={onConfirmPendingUpgrade}
          onCancelUpgrade={onCancelPendingUpgrade}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {plansToShow.map((p) => {
            const isUpgradeOption = isAuthed && (
              (effectivePlan === 'BASIC' && (p.name === 'VIP' || p.name === 'PREMIUM')) ||
              (effectivePlan === 'VIP' && p.name === 'PREMIUM')
            );

            return (
              <ScrollReveal key={p.name} delay={0.05 * plansToShow.indexOf(p)} duration={0.4}>
                <PlanCard
                  plan={p}
                  isAuthed={isAuthed}
                  isMaster={isMaster}
                  isVerified={isVerified}
                  effectivePlan={effectivePlan}
                  isUpgradeOption={isUpgradeOption}
                  checkoutLoading={checkoutLoading}
                  claimLoading={claimLoading}
                  onBuy={onBuy}
                />
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
