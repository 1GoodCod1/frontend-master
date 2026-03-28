import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectRole } from '@/features/auth/selectors';
import { SEOHead } from '@/components/seo/SEOHead';
import { usePlansLogic } from '@/hooks/payments';
import { LoadingState } from '@/components/common/States';
import { PlanCard } from '@/features/payments/components/PlanCard';
import { PlansAlerts } from '@/features/payments/components/PlansAlerts';
import { PlansComparisonTable } from '@/features/payments/components/PlansComparisonTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { isRecord } from '@/utils/guards';
import { USER_ROLE } from '@/constants/roles';

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

  if (role === USER_ROLE.ADMIN) {
    return (
      <>
        <SEOHead title={t('plans.adminView.title')} noindex />
        <div className="w-full max-w-md mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        <div className="mh-page-enter flex justify-center">
          <Card className="border border-border text-center overflow-hidden rounded-2xl w-full">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('plans.adminView.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('plans.adminView.subtitle')}
              </p>
              <Button asChild size="lg" className="rounded-xl">
                <RouterLink to="/admin/tariffs">
                  {t('plans.adminView.goToAdmin')}
                </RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  }

  if (isClient) {
    return (
      <>
        <SEOHead title={t('plans.becomeMaster.title')} noindex />
        <div className="w-full max-w-2xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        <div className="mh-page-enter flex justify-center">
          <Card className="border border-border text-center overflow-hidden rounded-2xl w-full">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {t('plans.becomeMaster.title')}
              </h2>
              <p className="text-base font-medium text-primary mb-4">
                {t('plans.becomeMaster.comingSoon')}
              </p>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                {t('plans.becomeMaster.description')}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch sm:items-center gap-3">
                <Button variant="outline" asChild className="rounded-xl">
                  <RouterLink to="/">{t('common.back')}</RouterLink>
                </Button>
                <Button asChild className="rounded-xl">
                  <RouterLink to="/masters">
                    {t('plans.becomeMaster.browseMasters')}
                  </RouterLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  }

  if (isLoading) {
    return <LoadingState label={t('plans.loading')} />;
  }

  return (
    <>
      <SEOHead
        title={t('plans.title')}
        description={t('plans.subtitle')}
        keywords="тарифы Master-Hub, планы для мастеров, Moldova"
      />
      <div className="mh-page-enter min-h-screen bg-gray-50/50 dark:bg-transparent">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-[max(3rem,env(safe-area-inset-bottom,0px))] sm:pb-16">
        <div className="text-center mb-8 sm:mb-12 pt-6 sm:pt-8 md:pt-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
            {isMaster ? t('plans.myPlan') : t('plans.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-1">
            {isMaster ? t('plans.myPlanSubtitle') : t('plans.subtitle')}
          </p>
        </div>

        {isMaster && !isVerified && (
          <div className="rounded-xl sm:rounded-2xl border border-amber-500/40 bg-amber-50/80 dark:bg-amber-900/20 p-4 sm:p-5 text-center mb-6 sm:mb-8">
            <p className="text-sm font-medium text-gray-900 dark:text-amber-100">
              {t('plans.verifyBanner')}
            </p>
            <RouterLink
              to="/dashboard/verification"
              className="text-sm font-semibold text-primary hover:underline mt-1 inline-block"
            >
              {t('plans.goToVerification')}
            </RouterLink>
          </div>
        )}

        <PlansAlerts
          isAuthed={isAuthed}
          effectivePlan={effectivePlan}
          isExpired={isExpired}
          pendingUpgrade={pendingUpgradeSafe}
          confirmLoading={confirmLoading}
          cancelLoading={cancelLoading}
          onConfirmUpgrade={onConfirmPendingUpgrade}
          onCancelUpgrade={onCancelPendingUpgrade}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 items-stretch">
          {plansToShow.map((p) => {
            const isUpgradeOption =
              isAuthed &&
              ((effectivePlan === 'BASIC' &&
                (p.name === 'VIP' || p.name === 'PREMIUM')) ||
                (effectivePlan === 'VIP' && p.name === 'PREMIUM'));

            return (
              <ScrollReveal
                key={p.name}
                delay={0.05 * plansToShow.indexOf(p)}
                duration={0.4}
                className="h-full min-h-0"
              >
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

        <PlansComparisonTable />
      </div>
    </div>
    </>
  );
}
