import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowUpCircle, Crown, Settings, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanUI } from '@/types/plans';
import { PaidTariff, TariffPlan } from '@/features/auth/plan';
import {
  planBadgeCls,
  planCardShellCls,
  planCtaCls,
  planDescCls,
  planIconWrapCls,
  planNameCls,
  planPriceCls,
  planStrikeCls,
} from '@/features/payments/planStyles';

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

function PlanTierIcon({ tier }: { tier: TariffPlan }) {
  const wrap = planIconWrapCls(tier);
  if (tier === 'BASIC') return null;
  if (tier === 'PLUS') {
    return (
      <span className={wrap}>
        <Star className="size-4 fill-current" />
      </span>
    );
  }
  return (
    <span className={wrap}>
      <Sparkles className="size-4" />
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

  const tier = plan.name as TariffPlan;
  const isCurrentPlan = isAuthed && plan.name === effectivePlan;
  const isPaid =
    plan.tariffType !== null && (plan.tariffType === 'PLUS' || plan.tariffType === 'PRO');

  const planKey = plan.name.toLowerCase();
  const regularPrice =
    t(`plans.${planKey}.price`) !== `plans.${planKey}.price` ? t(`plans.${planKey}.price`) : plan.price;
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

  const renderCta = () => {
    if (isCurrentPlan) {
      if (isPaid) {
        return (
          <Button asChild className={planCtaCls('outline')}>
            <RouterLink to="/dashboard/subscription" className="gap-2">
              <Settings className="size-4 shrink-0" />
              <span>{t('plans.manageSubscription')}</span>
            </RouterLink>
          </Button>
        );
      }
      return (
        <Button disabled className={planCtaCls('disabled')}>
          {t('plans.currentPlan')}
        </Button>
      );
    }
    if (showVerifyToGetFree) {
      return (
        <Button asChild className={planCtaCls('primary')}>
          <RouterLink to="/dashboard/verification" className="gap-2">
            <ShieldCheck className="size-4 shrink-0" />
            <span>
              {t('plans.claimFree')} {t(`plans.${planKey}.name`)}
            </span>
          </RouterLink>
        </Button>
      );
    }
    if ((isUpgradeOption || (isPaid && isMaster)) && isPaid) {
      return (
        <Button
          className={planCtaCls('primary')}
          disabled={checkoutLoading || claimLoading}
          onClick={() => plan.tariffType && onBuy(plan.tariffType)}
        >
          <ArrowUpCircle className="size-4 shrink-0" />
          <span>
            {t('plans.claimFree')} {t(`plans.${planKey}.name`)}
          </span>
        </Button>
      );
    }
    if (isPaid && !isMaster) {
      return (
        <Button asChild className={planCtaCls('primary')}>
          <RouterLink to="/register">{t('plans.registerToBuy')}</RouterLink>
        </Button>
      );
    }
    return (
      <Button disabled className={planCtaCls('disabled')}>
        {t('plans.free')}
      </Button>
    );
  };

  return (
    <div
      className={planCardShellCls({
        isCurrent: isCurrentPlan,
        isHighlighted: isPopular || tier === 'PRO',
        tier,
      })}
    >
      {isCurrentPlan ? <div className={planBadgeCls()}>{t('plans.current')}</div> : null}
      {isPopular ? <div className={planBadgeCls()}>{t('plans.mostPopular')}</div> : null}

      <div className="mb-2 flex items-center gap-2 sm:mb-3">
        <PlanTierIcon tier={tier} />
        <span className={planNameCls(tier)}>{t(`plans.${planKey}.name`, plan.name)}</span>
        {tier === 'PLUS' ? <Crown className="size-4 text-[#E97525] opacity-80" aria-hidden /> : null}
        {tier === 'PRO' ? <Zap className="size-4 text-[#c45f1a] opacity-80 dark:text-[#f08540]" aria-hidden /> : null}
      </div>

      <div className="mb-3">
        {showZeroPrice && regularPrice !== '0 MDL' ? <p className={planStrikeCls}>{regularPrice}</p> : null}
        <p className={planPriceCls}>{priceText}</p>
      </div>

      <p className={planDescCls}>{descriptionText}</p>

      <div className="flex-1" />
      <div className="mt-auto pt-4">{renderCta()}</div>
    </div>
  );
};
