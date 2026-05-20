import type { ReactNode } from 'react';
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
import { CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { isRecord } from '@/utils/guards';
import { USER_ROLE } from '@/constants/roles';
import { cn } from '@/lib/utils';
import {
  cabinetCardStaticCls,
  cabinetIconWrapCls,
  cabinetLinkCls,
  cabinetOutlineBtnCls,
  cabinetPrimaryBtnCls,
  cabinetTextMuted,
  cabinetTextTitle,
} from '@/lib/cabinetStyles';
import {
  plansHeroSubtitleCls,
  plansHeroTitleCls,
  plansPageInnerCls,
  plansPageWrapCls,
  plansVerifyBannerCls,
} from '@/features/payments/planStyles';

function PlansGateCard({
  icon,
  title,
  subtitle,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  actions: ReactNode;
}) {
  return (
    <div className={cn(plansPageWrapCls, 'flex justify-center py-8 sm:py-12')}>
      <div className={cn(cabinetCardStaticCls, 'w-full max-w-md overflow-hidden text-center')}>
        <CardContent className="p-6 sm:p-8 md:p-10">
          <div className={cn(cabinetIconWrapCls, 'mx-auto mb-5 size-14 rounded-2xl')}>{icon}</div>
          <h2 className={cn('mb-2 text-xl font-bold sm:text-2xl', cabinetTextTitle)}>{title}</h2>
          {subtitle ? <p className="mb-3 text-base font-semibold text-[#E97525]">{subtitle}</p> : null}
          {description ? <p className={cn('mb-6 max-w-lg mx-auto', cabinetTextMuted)}>{description}</p> : null}
          {actions}
        </CardContent>
      </div>
    </div>
  );
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
            typeof pendingUpgrade.hoursRemaining === 'number' ? pendingUpgrade.hoursRemaining : undefined,
        }
      : null;

  if (role === USER_ROLE.ADMIN) {
    return (
      <>
        <SEOHead title={t('plans.adminView.title')} noindex />
        <PlansGateCard
          icon={<CreditCard className="size-8" />}
          title={t('plans.adminView.title')}
          description={t('plans.adminView.subtitle')}
          actions={
            <Button asChild className={cabinetPrimaryBtnCls}>
              <RouterLink to="/admin/tariffs">{t('plans.adminView.goToAdmin')}</RouterLink>
            </Button>
          }
        />
      </>
    );
  }

  if (isClient) {
    return (
      <>
        <SEOHead title={t('plans.becomeMaster.title')} noindex />
        <PlansGateCard
          icon={<CreditCard className="size-8" />}
          title={t('plans.becomeMaster.title')}
          subtitle={t('plans.becomeMaster.comingSoon')}
          description={t('plans.becomeMaster.description')}
          actions={
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button variant="outline" asChild className={cabinetOutlineBtnCls}>
                <RouterLink to="/">{t('common.back')}</RouterLink>
              </Button>
              <Button asChild className={cabinetPrimaryBtnCls}>
                <RouterLink to="/masters">{t('plans.becomeMaster.browseMasters')}</RouterLink>
              </Button>
            </div>
          }
        />
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
        keywords={t('plans.seoKeywords')}
      />
      <div className={plansPageWrapCls}>
        <div className={plansPageInnerCls}>
          <div className="mb-8 pt-6 text-center sm:mb-12 sm:pt-8 md:pt-12">
            <h1 className={plansHeroTitleCls}>{isMaster ? t('plans.myPlan') : t('plans.title')}</h1>
            <p className={cn(plansHeroSubtitleCls, 'mt-2 sm:mt-3')}>
              {isMaster ? t('plans.myPlanSubtitle') : t('plans.subtitle')}
            </p>
          </div>

          {isMaster && !isVerified ? (
            <div className={plansVerifyBannerCls}>
              <p className="text-[13px] font-medium text-[#212529] dark:text-white/90">{t('plans.verifyBanner')}</p>
              <RouterLink to="/dashboard/verification" className={cn(cabinetLinkCls, 'mt-1 inline-block text-sm')}>
                {t('plans.goToVerification')}
              </RouterLink>
            </div>
          ) : null}

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

          {!isAuthed ? (
            <p className={cn(plansVerifyBannerCls, 'mb-6 text-[13px] font-medium sm:mb-8')}>
              {t('plans.registerToGetFreeDesc')}
            </p>
          ) : null}

          <div className="mb-6 grid grid-cols-1 items-stretch gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {plansToShow.map((p, index) => {
              const isUpgradeOption =
                isAuthed &&
                ((effectivePlan === 'BASIC' && (p.name === 'PLUS' || p.name === 'PRO')) ||
                  (effectivePlan === 'PLUS' && p.name === 'PRO'));

              return (
                <ScrollReveal key={p.name} delay={0.05 * index} duration={0.4} className="h-full min-h-0">
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
