import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { CheckCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const priceText = showFree ? '0 MDL' : regularPrice;
  const descriptionText =
    t(`plans.${planKey}.description`) !== `plans.${planKey}.description`
      ? t(`plans.${planKey}.description`)
      : plan.description || '';
  const featuresObj = t(`plans.${planKey}.features`, {
    returnObjects: true,
  }) as Record<string, string> | string;
  const features =
    typeof featuresObj === 'object' &&
    featuresObj !== null &&
    !Array.isArray(featuresObj)
      ? Object.values(featuresObj)
      : plan.features && plan.features.length > 0
        ? plan.features
        : [];

  const isPopular = plan.highlight && !isAuthed && !isCurrentPlan;
  const planName = plan.name?.toUpperCase() || '';

  const planAccent: Record<string, { text: string; iconBg: string }> = {
    BASIC:   { text: 'text-primary',                             iconBg: 'bg-primary/10' },
    VIP:     { text: 'text-amber-500 dark:text-amber-400',       iconBg: 'bg-amber-500/10' },
    PREMIUM: { text: 'text-violet-500 dark:text-violet-400',     iconBg: 'bg-violet-500/10' },
  };
  const accent = planAccent[planName] ?? { text: 'text-foreground', iconBg: 'bg-muted' };

  const cardClassName = cn(
    'relative h-full rounded-2xl p-6 transition-all',
    isCurrentPlan && 'border-2 border-primary shadow-md shadow-primary/10',
    isPopular && 'border-2 border-primary/50 shadow-md shadow-primary/10',
    !isCurrentPlan && !isPopular && 'border border-border'
  );
  const priceClass = 'text-2xl font-black text-foreground';
  const descClass = 'text-sm text-muted-foreground';

  return (
    <Card className={cardClassName}>
      {isCurrentPlan && (
        <Badge
          variant="outline"
          className={cn('absolute right-4 top-4 font-semibold border', accent.text)}
        >
          {t('plans.current')}
        </Badge>
      )}
      {isPopular && (
        <Badge variant="default" className="absolute right-4 top-4">
          {t('plans.mostPopular')}
        </Badge>
      )}

      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-row items-center gap-3">
          {plan.icon && (
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', accent.iconBg, accent.text)}>
              {plan.icon}
            </span>
          )}
          <h3 className={cn('text-base font-bold', accent.text)}>
            {t(`plans.${plan.name.toLowerCase()}.name`)}
          </h3>
        </div>

        <div className="flex flex-col gap-0.5">
          {showFree && regularPrice !== '0 MDL' && (
            <p className="text-sm text-muted-foreground line-through">{regularPrice}</p>
          )}
          <p className={cn(priceClass, isCurrentPlan && 'underline')}>{priceText}</p>
        </div>
        <p className={descClass}>{descriptionText}</p>

        <Separator />

        <ul className="flex flex-col gap-2">
          {features.map((f: string, idx: number) => (
            <li key={idx} className="flex flex-row items-start gap-2">
              <CheckCircle className={cn('h-4 w-4 shrink-0 mt-0.5', accent.text)} />
              <span className="text-sm text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2">
          {isCurrentPlan ? (
            <Button variant="outline" disabled className="w-full">
              {t('plans.currentPlan')}
            </Button>
          ) : isUpgradeOption && isPaid && isMaster ? (
            <Button
              variant="default"
              size="lg"
              className="w-full font-semibold transition-all hover:-translate-y-0.5"
              disabled={checkoutLoading || claimLoading}
              onClick={() => plan.tariffType && onBuy(plan.tariffType)}
            >
              <ArrowUpCircle className="h-4 w-4" />
              {isVerified ? t('plans.claimFree') : t('plans.upgradeTo')} {t(`plans.${plan.name.toLowerCase()}.name`)}
            </Button>
          ) : isPaid && isMaster ? (
            <Button
              variant={plan.highlight ? 'default' : 'outline'}
              size="lg"
              className="w-full font-semibold transition-all hover:-translate-y-0.5"
              disabled={checkoutLoading || claimLoading}
              onClick={() => plan.tariffType && onBuy(plan.tariffType)}
            >
              {isVerified ? t('plans.claimFree') : t('plans.buy')} {t(`plans.${plan.name.toLowerCase()}.name`)}
            </Button>
          ) : isPaid && !isMaster ? (
            <Button
              asChild
              variant={plan.highlight ? 'default' : 'outline'}
              size="lg"
              className="w-full font-semibold transition-all hover:-translate-y-0.5"
            >
              <RouterLink to="/register">{t('plans.registerToBuy')}</RouterLink>
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              {t('plans.free')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
