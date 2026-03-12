import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowUpCircle, Settings, ShieldCheck, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanUI } from '@/types/plans';
import { PaidTariff, TariffPlan } from '@/features/auth/plan';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanUI;
  isAuthed: boolean;
  isMaster: boolean;
  isVerified?: boolean;
  effectivePlan: TariffPlan;
  isUpgradeOption: boolean;
  checkoutLoading: boolean;
  claimLoading?: boolean;
  onBuy: (type: PaidTariff) => void;
}

function PlanIcon({ planName }: { planName: string }) {
  const planNameUpper = planName?.toUpperCase() || '';
  if (planNameUpper === 'BASIC') return null;
  const isVip = planNameUpper === 'VIP';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg',
        isVip
          ? 'bg-orange-100 text-orange-500 dark:bg-orange-500/30 dark:text-orange-400'
          : 'bg-teal-100 text-teal-600 dark:bg-teal-500/30 dark:text-teal-400'
      )}
    >
      {isVip ? (
        <Star className="w-4 h-4 fill-current" />
      ) : (
        <Zap className="w-4 h-4 fill-current" />
      )}
    </span>
  );
}

export const PlanCard = ({
  plan,
  isAuthed,
  isMaster,
  isVerified = false,
  effectivePlan,
  isUpgradeOption,
  checkoutLoading,
  claimLoading = false,
  onBuy,
}: PlanCardProps) => {
  const { t } = useTranslation();

  const isCurrentPlan = isAuthed && plan.name === effectivePlan;
  const isPaid =
    plan.tariffType !== null &&
    (plan.tariffType === 'VIP' || plan.tariffType === 'PREMIUM');

  const planKey = plan.name.toLowerCase();
  const regularPrice =
    t(`plans.${planKey}.price`) !== `plans.${planKey}.price`
      ? t(`plans.${planKey}.price`)
      : plan.price;
  const showFree = isMaster && isVerified && isPaid;
  const showVerifyToGetFree = isMaster && !isVerified && isPaid;
  const showRegisterToGetFree = !isAuthed && isPaid;
  const showZeroPrice =
    (showFree || showVerifyToGetFree || showRegisterToGetFree) && isPaid;
  const priceText = showZeroPrice ? '0 MDL' : regularPrice;
  const descriptionText =
    t(`plans.${planKey}.description`) !== `plans.${planKey}.description`
      ? t(`plans.${planKey}.description`)
      : plan.description || '';

  const isPopular = plan.highlight && !isAuthed && !isCurrentPlan;
  const planName = plan.name?.toUpperCase() || '';
  const isVip = planName === 'VIP';
  const isPremium = planName === 'PREMIUM';

  const cardClassName = cn(
    'relative rounded-2xl border p-5 flex flex-col transition-all overflow-hidden',
    'bg-white dark:bg-zinc-900/95',
    'border border-gray-200 dark:border-zinc-800',
    'shadow-sm dark:shadow-none'
  );

  const ctaDisabled = isCurrentPlan;
  const ctaBg = ctaDisabled
    ? 'bg-transparent border border-gray-200 text-gray-500 cursor-default dark:bg-orange-500/90 dark:border-orange-500 dark:text-white'
    : isVip && !ctaDisabled
      ? 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 dark:bg-orange-500 dark:border-orange-500 dark:hover:bg-orange-600 dark:text-white'
      : isPremium && !ctaDisabled
        ? 'bg-white border border-teal-500 text-teal-600 hover:bg-teal-50 dark:bg-zinc-800 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-700'
        : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white';

  const renderCta = () => {
    if (isCurrentPlan) {
      if (isPaid) {
        return (
          <Button
            asChild
            className={cn('w-full py-2.5 rounded-xl text-sm font-medium', ctaBg)}
          >
            <RouterLink to="/dashboard/subscription">
              <Settings className="h-4 w-4 shrink-0" />
              <span>{t('plans.manageSubscription')}</span>
            </RouterLink>
          </Button>
        );
      }
      return (
        <Button disabled className={cn('w-full py-2.5 rounded-xl', ctaBg)}>
          {t('plans.currentPlan')}
        </Button>
      );
    }
    if (showVerifyToGetFree) {
      return (
        <Button
          asChild
          className={cn('w-full py-2.5 rounded-xl text-sm font-medium', ctaBg)}
        >
          <RouterLink to="/dashboard/verification">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              {t('plans.claimFree')} {t(`plans.${planKey}.name`)}
            </span>
          </RouterLink>
        </Button>
      );
    }
    if (isUpgradeOption && isPaid && isMaster) {
      return (
        <Button
          className={cn('w-full py-2.5 rounded-xl text-sm font-medium', ctaBg)}
          disabled={checkoutLoading || claimLoading}
          onClick={() => plan.tariffType && onBuy(plan.tariffType)}
        >
          <ArrowUpCircle className="h-4 w-4 shrink-0" />
          <span>
            {t('plans.claimFree')} {t(`plans.${planKey}.name`)}
          </span>
        </Button>
      );
    }
    if (isPaid && isMaster) {
      return (
        <Button
          className={cn('w-full py-2.5 rounded-xl text-sm font-medium', ctaBg)}
          disabled={checkoutLoading || claimLoading}
          onClick={() => plan.tariffType && onBuy(plan.tariffType)}
        >
          <span>
            {t('plans.claimFree')} {t(`plans.${planKey}.name`)}
          </span>
        </Button>
      );
    }
    if (isPaid && !isMaster) {
      return (
        <Button asChild className={cn('w-full py-2.5 rounded-xl text-sm font-medium', ctaBg)}>
          <RouterLink to="/register">{t('plans.registerToBuy')}</RouterLink>
        </Button>
      );
    }
    return (
      <Button disabled className={cn('w-full py-2.5 rounded-xl', ctaBg)}>
        {t('plans.free')}
      </Button>
    );
  };

  return (
    <div className={cardClassName}>
      {isCurrentPlan && (
        <div className="absolute -top-px right-4 text-xs px-3 py-1.5 rounded-b-xl rounded-t-none font-medium bg-gray-900 text-white dark:bg-orange-500 dark:text-white">
          {t('plans.current')}
        </div>
      )}
      {isPopular && (
        <div className="absolute -top-px right-4 text-xs px-3 py-1.5 rounded-b-xl rounded-t-none font-medium bg-gray-900 text-white dark:bg-orange-500 dark:text-white">
          {t('plans.mostPopular')}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <PlanIcon planName={planName} />
        <span
          className={cn(
            'font-bold tracking-wide text-gray-900 dark:text-foreground',
            isVip && 'dark:text-orange-400',
            planName === 'PREMIUM' && 'dark:text-teal-400'
          )}
        >
          {plan.name}
        </span>
      </div>

      <div className="mb-3">
        {showZeroPrice && regularPrice !== '0 MDL' && (
          <p className="text-sm text-gray-500 dark:text-zinc-400 line-through">
            {regularPrice}
          </p>
        )}
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{priceText}</p>
      </div>

      <p className="text-sm text-gray-600 dark:text-zinc-300 mb-3">{descriptionText}</p>

      {(showRegisterToGetFree || showVerifyToGetFree) && isPaid && (
        <p
          className={cn(
            'text-xs mb-4',
            isVip && 'text-orange-500 dark:text-orange-400',
            planName === 'PREMIUM' && 'text-teal-600 dark:text-teal-400'
          )}
        >
          {t('plans.registerToGetFreeDesc')}
        </p>
      )}

      <div className="flex-1" />

      <div className="mt-4">{renderCta()}</div>
    </div>
  );
};
