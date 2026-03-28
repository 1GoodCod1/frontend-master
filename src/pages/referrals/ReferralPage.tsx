import { useTranslation } from 'react-i18next';
import { Copy, Gift, ExternalLink, Share2, Users, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/common/States';
import { useReferralsGetMyQuery, useConfigReferralsEnabledQuery } from '@/features/referrals/referralsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { REFERRAL_STATUS } from '@/constants/referralStatus';

/**
 * Referral program page — shared by both Client and Master dashboards.
 * Both roles can invite friends and earn bonuses (masters get tariff extension, clients get in-app bonus notification).
 */
export default function ReferralPage() {
    const { t, i18n } = useTranslation();
    const { data: referralsConfig } = useConfigReferralsEnabledQuery();
    const { data: referralInfo, isLoading, isError, error, refetch } = useReferralsGetMyQuery();

    const { code = '', referrals = [], stats } = referralInfo ?? {};
    const referralsEnabled = referralsConfig?.enabled ?? false;

    if (isLoading) return <LoadingState label={t('referrals.loading')} />;
    if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

    if (!referralsEnabled) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8 space-y-8 animate-in fade-in">
                <PageHeader title={t('referrals.title')} subtitle={t('referrals.subtitle')} />
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <Gift className="size-12 text-amber-500/50 mb-4" />
                        <h4 className="text-lg font-semibold">{t('referrals.disabled')}</h4>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                            {t('referrals.disabledDesc')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const safeStats = stats ?? { total: 0, pending: 0, qualified: 0, rewarded: 0 };

    const referralLink = `${window.location.origin}/register?ref=${code}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success(t('referrals.linkCopied'));
    };

    const shareViaWhatsApp = () => {
        const text = t('referrals.shareText', { link: referralLink });
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title={t('referrals.title')}
                subtitle={t('referrals.subtitle')}
            />

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 bg-amber-500/10 p-20 rounded-full blur-3xl pointer-events-none"></div>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Gift className="size-6 text-amber-600" />
                            {t('referrals.yourBonus')}
                        </CardTitle>
                        <CardDescription className="text-base text-foreground/80">
                            {t('referrals.bonusDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">{t('referrals.yourLink')}</p>
                            <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border shadow-inner">
                                <code className="flex-1 px-3 text-sm font-mono truncate text-amber-600 dark:text-amber-400">
                                    {referralLink}
                                </code>
                                <Button size="icon" variant="secondary" className="shrink-0 h-9 w-9 rounded-lg" onClick={copyToClipboard}>
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={copyToClipboard} className="flex-1 gap-2 font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white">
                                <Share2 className="size-4" />
                                {t('referrals.copyButton')}
                            </Button>
                            <Button onClick={shareViaWhatsApp} variant="outline" className="flex-1 gap-2 border-[#25D366]/50 bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]">
                                <ExternalLink className="size-4" />
                                WhatsApp
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col items-center justify-center p-6 text-center shadow-sm">
                        <Users className="size-8 text-blue-500 mb-3 opacity-80" />
                        <h3 className="text-3xl font-bold">{safeStats.total}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t('referrals.totalInvited')}</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center shadow-sm border-emerald-500/20 bg-emerald-500/5">
                        <CheckCircle className="size-8 text-emerald-500 mb-3 opacity-80" />
                        <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{safeStats.qualified}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t('referrals.qualifiedSuccess')}</p>
                    </Card>
                </div>
            </div>

            {/* Friends List */}
            <h3 className="text-xl font-bold mt-10 mb-4">{t('referrals.yourFriends')}</h3>
            {referrals.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <Users className="size-12 text-muted-foreground/30 mb-4" />
                        <h4 className="text-lg font-semibold">{t('referrals.emptyTitle')}</h4>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                            {t('referrals.emptyDesc')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(referrals ?? []).map((r) => {
                        const isQualified =
                          r.status === REFERRAL_STATUS.QUALIFIED ||
                          r.status === REFERRAL_STATUS.REWARDED;
                        return (
                            <Card key={r.id} className="overflow-hidden shadow-sm transition hover:shadow-md">
                                <CardHeader className="p-4 pb-2 flex-row justify-between items-start space-y-0 relative z-10">
                                    <div>
                                        <CardTitle className="text-base">
                                            {r.referredUser?.firstName || t('referrals.user')} {r.referredUser?.lastName || ''}
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            {formatDateTimeString(new Date(r.createdAt), getLocaleFromLanguage(i18n.language))}
                                        </CardDescription>
                                    </div>
                                    {isQualified ? (
                                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                            <CheckCircle className="mr-1 size-3" />
                                            {t('referrals.statusQualified')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                            <Clock className="mr-1 size-3" />
                                            {t('referrals.statusPending')}
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4 pt-2 text-sm text-muted-foreground">
                                    {isQualified
                                        ? t('referrals.descQualified')
                                        : t('referrals.descPending')}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
