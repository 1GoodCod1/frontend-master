import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { toErrorMessage } from '@/utils/errors';
import type { MasterTariffResponse, PaymentDto } from '@/types';

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    BASIC: {
        bg: 'bg-slate-50 dark:bg-slate-900/40',
        border: 'border-slate-200 dark:border-slate-700',
        text: 'text-slate-700 dark:text-slate-300',
        icon: 'text-slate-500 dark:text-slate-400',
    },
    VIP: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
        border: 'border-amber-300 dark:border-amber-600/40',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-500 dark:text-amber-400',
    },
    PREMIUM: {
        bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30',
        border: 'border-teal-300 dark:border-teal-600/40',
        text: 'text-teal-700 dark:text-teal-300',
        icon: 'text-teal-500 dark:text-teal-400',
    },
};

const PlanIcon = ({ plan }: { plan: string }) => {
    const colors = PLAN_COLORS[plan] || PLAN_COLORS.BASIC;
    if (plan === 'PREMIUM') return <Sparkles className={cn('h-8 w-8', colors.icon)} />;
    if (plan === 'VIP') return <Crown className={cn('h-8 w-8', colors.icon)} />;
    return <Zap className={cn('h-8 w-8', colors.icon)} />;
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
    const colors = PLAN_COLORS[effectivePlan] || PLAN_COLORS.BASIC;

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                    {t('subscription.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('subscription.subtitle')}
                </p>
            </div>

            {/* Current Plan Card */}
            <Card className={cn(
                'overflow-hidden relative border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300',
                effectivePlan === 'VIP' && 'border-amber-200/50 dark:border-amber-600/30',
                effectivePlan === 'PREMIUM' && 'border-teal-200/50 dark:border-teal-600/30'
            )}>
                <div className={cn('absolute inset-0 opacity-50', colors.bg)} />
                <CardContent className="relative p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className={cn(
                            'flex items-center justify-center w-16 h-16 rounded-2xl',
                            effectivePlan === 'PREMIUM' ? 'bg-teal-100 dark:bg-teal-900/40' :
                                effectivePlan === 'VIP' ? 'bg-amber-100 dark:bg-amber-900/40' :
                                    'bg-slate-100 dark:bg-slate-800'
                        )}>
                            <PlanIcon plan={effectivePlan} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className={cn('text-2xl font-extrabold', colors.text)}>
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
                                    <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-600 text-xs px-3">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        {t('subscription.cancelledAlready')}
                                    </Badge>
                                )}
                            </div>

                            {isActive && tariffExpiresAt ? (
                                <p className="text-sm text-muted-foreground mt-2">
                                    <Clock className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                                    {t('subscription.expiresAt')}: <strong>{formatDateShort(tariffExpiresAt, locale)}</strong>
                                </p>
                            ) : effectivePlan === 'BASIC' ? (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('subscription.noPaidPlanDesc')}
                                </p>
                            ) : null}
                        </div>

                        {effectivePlan === 'BASIC' && (
                            <Button
                                asChild
                                size="lg"
                                className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
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
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Alert className="border-amber-300 dark:border-amber-600/40 bg-amber-50/80 dark:bg-amber-900/20">
                        <ArrowUpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="flex flex-col gap-3">
                            <div>
                                <strong className="text-amber-700 dark:text-amber-300">
                                    {t('subscription.pendingUpgrade')}
                                </strong>
                                <p className="text-sm mt-1">
                                    {t('subscription.pendingUpgradeDesc', {
                                        tariff: pendingUpgrade.to,
                                        hours: Math.ceil(pendingUpgrade.hoursRemaining ?? 0),
                                    })}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleConfirmUpgrade}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {t('subscription.confirmUpgrade')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={cancelUpgradeState.isLoading}
                                    onClick={handleCancelUpgrade}
                                >
                                    <XCircle className="h-4 w-4" />
                                    {t('subscription.cancelUpgrade')}
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upgrade Section */}
                {effectivePlan !== 'PREMIUM' && !pendingUpgrade && (
                    <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 border-teal-200/50 dark:border-teal-600/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20 pointer-events-none" />
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                                <ArrowUpCircle className="h-5 w-5" />
                                {t('subscription.upgradeTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {t('subscription.upgradeDesc')}
                            </p>

                            <Button
                                size="lg"
                                className={cn(
                                    'w-full font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5',
                                    'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white'
                                )}
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
                    <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                                {t('subscription.cancelTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cancelAtPeriodEnd ? (
                                <Alert className="border-amber-200 dark:border-amber-700/30 bg-amber-50/50 dark:bg-amber-950/20">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <AlertDescription className="text-sm">
                                        <strong>{t('subscription.cancelledAlready')}</strong>
                                        <p className="mt-1 text-muted-foreground">
                                            {t('subscription.cancelledAlreadyDesc')}
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        {t('subscription.cancelDesc')}
                                    </p>
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
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
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
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
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
                                                'flex items-center justify-center w-8 h-8 rounded-lg',
                                                payment.tariffType === 'PREMIUM' ? 'bg-teal-100 dark:bg-teal-900/30' :
                                                    payment.tariffType === 'VIP' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                        'bg-slate-100 dark:bg-slate-800'
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
        </motion.div>
    );
}
