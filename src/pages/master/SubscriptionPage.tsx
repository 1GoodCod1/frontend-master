import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Crown,
    Sparkles,
    ArrowUpCircle,
    XCircle,
    CreditCard,
    Clock,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Zap,
} from 'lucide-react';
import { useMastersMyTariffQuery } from '@/features/masters/mastersApi';
import {
    usePaymentsCancelPendingUpgradeMutation,
    usePaymentsCancelTariffAtPeriodEndMutation,
    usePaymentsMyQuery,
} from '@/features/payments/paymentsApi';
import { useAppSelector } from '@/app/hooks';
import { selectPlan, selectIsVerified } from '@/features/auth/selectors';
import { TariffPlan } from '@/features/auth/plan';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { LoadingState } from '@/components/common/States';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
    masterCardStaticCls,
    masterIconWrapCls,
    masterOutlineBtnCls,
    masterPageClassName,
    masterPrimaryBtnCls,
    masterSectionTitleCls,
    masterTextMuted,
} from '@/lib/masterCabinetStyles';
import { toErrorMessage } from '@/utils/errors';
import type { MasterTariffResponse, PaymentDto } from '@/types';

const PLAN_ACCENT: Record<string, { wash: string; text: string; iconWrap: string }> = {
    BASIC: {
        wash: 'bg-[#F4F5F7]/80 dark:bg-white/[0.03]',
        text: 'text-[#495057] dark:text-white/80',
        iconWrap: 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.08] dark:text-white/55',
    },
    VIP: {
        wash: 'bg-[#FFF8EB]/60 dark:bg-[#E97525]/8',
        text: 'text-[#E97525]',
        iconWrap: masterIconWrapCls,
    },
    PREMIUM: {
        wash: 'bg-[#E97525]/8 dark:bg-[#E97525]/12',
        text: 'text-[#c45f1a] dark:text-[#f08540]',
        iconWrap: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E97525]/15 text-[#E97525] dark:bg-[#E97525]/20',
    },
};

const PlanIcon = ({ plan }: { plan: string }) => {
    const accent = PLAN_ACCENT[plan] || PLAN_ACCENT.BASIC;
    if (plan === 'PREMIUM') return <Sparkles className={cn('h-7 w-7', accent.text)} />;
    if (plan === 'VIP') return <Crown className={cn('h-7 w-7', accent.text)} />;
    return <Zap className={cn('h-7 w-7', accent.text)} />;
};

export default function SubscriptionPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const locale = getLocaleFromLanguage(i18n.language);
    const plan: TariffPlan = useAppSelector(selectPlan) ?? 'BASIC';
    const isVerified = useAppSelector(selectIsVerified);

    const { data: tariffRaw, isLoading: tariffLoading, refetch: refetchTariff } = useMastersMyTariffQuery();
    const { data: paymentsRaw, isLoading: paymentsLoading } = usePaymentsMyQuery();
    const [cancelPendingUpgrade, cancelUpgradeState] = usePaymentsCancelPendingUpgradeMutation();
    const [cancelTariffAtPeriodEnd, cancelAtPeriodEndState] = usePaymentsCancelTariffAtPeriodEndMutation();
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

    const tariffData = (tariffRaw as { data?: MasterTariffResponse } | undefined)?.data ?? (tariffRaw as MasterTariffResponse | undefined);
    const tariffType: TariffPlan = tariffData?.tariffType ?? plan;
    const tariffExpiresAt = tariffData?.tariffExpiresAt ? new Date(tariffData.tariffExpiresAt) : null;
    const isExpired = tariffData?.isExpired ?? false;
    const pendingUpgrade = tariffData?.pendingUpgrade;
    const cancelAtPeriodEnd = tariffData?.tariffCancelAtPeriodEnd ?? false;


    const paymentsArray = paymentsRaw ?? [];
    const recentPayments = paymentsArray
        .filter((p) => p?.status === 'SUCCESS')
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 5);

    const effectivePlan: TariffPlan = !isExpired && tariffType !== 'BASIC' ? tariffType : 'BASIC';

    const isActive = !isExpired && effectivePlan !== 'BASIC';
    const accent = PLAN_ACCENT[effectivePlan] || PLAN_ACCENT.BASIC;

    const handleCancelUpgrade = async () => {
        try {
            await cancelPendingUpgrade().unwrap();
            toast.success(t('subscription.upgradeCancelled'));
            refetchTariff();
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('plans.cancelFailed'));
        }
    };

    const handleCancelSubscription = async () => {
        try {
            await cancelTariffAtPeriodEnd().unwrap();
            toast.success(t('plans.cancelAtPeriodEndSuccess'));
            refetchTariff();
            setCancelConfirmOpen(false);
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('plans.cancelFailed'));
        }
    };

    const handleConfirmUpgrade = () => {
        if (isVerified) {
            navigate('/plans');
            return;
        }
        const planParam = pendingUpgrade?.to ? `&plan=${encodeURIComponent(pendingUpgrade.to)}` : '';
        navigate(`/plans/checkout?pending=1${planParam}`);
    };

    const handleUpgrade = () => {
        if (isVerified) {
            navigate('/plans');
            return;
        }
        navigate('/plans/checkout?plan=PREMIUM');
    };

    if (tariffLoading) {
        return <LoadingState label={t('plans.loading')} />;
    }

    return (
        <div className={cn(masterPageClassName, 'faber-page-enter')}>
            {/* Header */}
            <div>
                <h1 className={masterSectionTitleCls}>{t('subscription.title')}</h1>
                <p className={cn(masterTextMuted, 'mt-1')}>{t('subscription.subtitle')}</p>
            </div>

            {/* Current Plan Card */}
            <Card className={cn(
                masterCardStaticCls,
                'relative overflow-hidden',
                effectivePlan !== 'BASIC' && 'border-[#E97525]/30',
            )}>
                <div className={cn('absolute inset-0', accent.wash)} />
                <CardContent className="relative p-6 md:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', accent.iconWrap)}>
                            <PlanIcon plan={effectivePlan} />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className={cn('text-2xl font-extrabold', accent.text)}>
                                    {t(`plans.${effectivePlan.toLowerCase()}.name`)}
                                </h2>
                                {isActive && (
                                    <Badge variant="default" className="bg-green-500/90 hover:bg-green-600 text-white text-xs px-3">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {t('subscription.active')}
                                    </Badge>
                                )}
                                {isExpired && (
                                    <Badge variant="destructive" className="text-xs px-3">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {t('subscription.expired')}
                                    </Badge>
                                )}
                                {cancelAtPeriodEnd && (
                                    <Badge variant="outline" className="text-[#E97525] border-amber-300 dark:text-[#f08540] dark:border-amber-600 text-xs px-3">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        {t('subscription.cancelledAlready')}
                                    </Badge>
                                )}
                            </div>

                            {isActive && tariffExpiresAt ? (
                                <p className={cn(masterTextMuted, 'mt-2')}>
                                    <Clock className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                                    {t('subscription.expiresAt')}: <strong>{formatDateShort(tariffExpiresAt, locale)}</strong>
                                </p>
                            ) : effectivePlan === 'BASIC' ? (
                                <p className={cn(masterTextMuted, 'mt-2')}>{t('subscription.noPaidPlanDesc')}</p>
                            ) : null}
                        </div>

                        {effectivePlan === 'BASIC' && (
                            <Button asChild className={masterPrimaryBtnCls}>
                                <RouterLink to="/plans">
                                    <ArrowUpCircle className="h-4 w-4" />
                                    {t('subscription.viewPlans')}
                                </RouterLink>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pending Upgrade Alert */}
            {pendingUpgrade && (
                <div className="faber-view-swap">
                    <Alert className="rounded-[14px] border-[#E97525]/30 bg-[#FFF8EB]/90 dark:bg-[#E97525]/10">
                        <ArrowUpCircle className="h-5 w-5 text-[#E97525]" />
                        <AlertDescription className="flex flex-col gap-3">
                            <div>
                                <strong className="text-[#c45f1a] dark:text-[#f08540]">
                                    {t('subscription.pendingUpgrade')}
                                </strong>
                                <p className={cn(masterTextMuted, 'mt-1')}>
                                    {t('subscription.pendingUpgradeDesc', {
                                        tariff: pendingUpgrade.to,
                                        hours: Math.ceil(pendingUpgrade.hoursRemaining ?? 0),
                                    })}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" size="sm" className={masterPrimaryBtnCls} onClick={handleConfirmUpgrade}>
                                    <CheckCircle className="h-4 w-4" />
                                    {t('subscription.confirmUpgrade')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={masterOutlineBtnCls}
                                    disabled={cancelUpgradeState.isLoading}
                                    onClick={handleCancelUpgrade}
                                >
                                    <XCircle className="h-4 w-4" />
                                    {t('subscription.cancelUpgrade')}
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upgrade Section */}
                {effectivePlan !== 'PREMIUM' && !pendingUpgrade && (
                    <Card className={cn(masterCardStaticCls, 'overflow-hidden border-[#E97525]/25')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#E97525]">
                                <ArrowUpCircle className="h-5 w-5" />
                                {t('subscription.upgradeTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className={masterTextMuted}>{t('subscription.upgradeDesc')}</p>

                            <Button
                                className={cn(masterPrimaryBtnCls, 'w-full')}
                                onClick={effectivePlan === 'BASIC' ? () => navigate('/plans') : handleUpgrade}
                            >
                                <Sparkles className="h-4 w-4" />
                                {effectivePlan === 'BASIC'
                                    ? t('subscription.viewPlans')
                                    : isVerified
                                        ? t('subscription.getPremiumFree')
                                        : t('subscription.upgradeToPremium')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Cancel Subscription Section */}
                {isActive && (
                    <Card className={cn(masterCardStaticCls, 'overflow-hidden')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                                {t('subscription.cancelTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cancelAtPeriodEnd ? (
                                <Alert className="rounded-[12px] border-[#E97525]/25 bg-[#FFF8EB]/80 dark:bg-[#E97525]/8">
                                    <AlertTriangle className="h-4 w-4 text-[#E97525]" />
                                    <AlertDescription className="text-sm">
                                        <strong>{t('subscription.cancelledAlready')}</strong>
                                        <p className={cn('mt-1', masterTextMuted)}>{t('subscription.cancelledAlreadyDesc')}</p>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <p className={masterTextMuted}>{t('subscription.cancelDesc')}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
                                        disabled={cancelAtPeriodEndState.isLoading}
                                        onClick={() => setCancelConfirmOpen(true)}
                                    >
                                        {cancelAtPeriodEndState.isLoading
                                            ? t('common.loading', 'Загрузка...')
                                            : t('plans.cancelAtPeriodEndButton')}
                                    </Button>
                                    <ConfirmDialog
                                        open={cancelConfirmOpen}
                                        title={t('subscription.cancelConfirmTitle')}
                                        description={t('subscription.cancelConfirmDesc')}
                                        confirmText={t('subscription.cancelConfirmButton')}
                                        cancelText={t('common.cancel')}
                                        confirmColor="error"
                                        isLoading={cancelAtPeriodEndState.isLoading}
                                        contentClassName="sm:max-w-md"
                                        onClose={() => setCancelConfirmOpen(false)}
                                        onConfirm={handleCancelSubscription}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Plan Benefits */}
                <Card className={cn(masterCardStaticCls, 'overflow-hidden')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            {t('subscription.benefits')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const planKey = effectivePlan.toLowerCase();
                            const featuresObj = t(`plans.${planKey}.features`, { returnObjects: true }) as Record<string, string> | string;
                            const features = typeof featuresObj === 'object' && featuresObj !== null && !Array.isArray(featuresObj)
                                ? Object.values(featuresObj)
                                : [];
                            return (
                                <ul className="space-y-2.5">
                                    {features.map((f: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2.5">
                                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                                            <span className="text-sm text-foreground">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Payment History Card */}
                <Card className={cn(masterCardStaticCls, 'overflow-hidden')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            {t('subscription.paymentHistory')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paymentsLoading ? (
                            <div className="text-sm text-muted-foreground animate-pulse">
                                {t('common.loading', 'Loading...')}
                            </div>
                        ) : recentPayments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('subscription.noPayments')}</p>
                        ) : (
                            <div className="space-y-3">
                                {recentPayments.map((payment: PaymentDto) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.08] last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-lg',
                                                PLAN_ACCENT[payment.tariffType || 'BASIC']?.iconWrap ?? PLAN_ACCENT.BASIC.iconWrap,
                                            )}>
                                                <PlanIcon plan={payment.tariffType || 'BASIC'} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{payment.tariffType || 'BASIC'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.createdAt ? formatDateShort(new Date(payment.createdAt), locale) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            {payment.amount} {payment.currency || 'MDL'}
                                        </span>
                                    </div>
                                ))}
                                <Separator />
                                <Button variant="ghost" size="sm" className="w-full" asChild>
                                    <RouterLink to="/dashboard/payments" className="flex items-center gap-2">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        {t('subscription.viewAllPayments')}
                                    </RouterLink>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
