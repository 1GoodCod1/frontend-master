import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    MessageCircle,
    CalendarDays,
    ListChecks,
    ArrowRight,
    Clock,
    User,
    Phone,
    Mail,
    Sparkles,
    Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LeadStatusProgress } from '@/features/leads/components/LeadStatusProgress';
import { useLeadsByIdQuery } from '@/features/leads/leadsApi';
import {
    useCreateConversationMutation,
    useGetConversationByLeadIdQuery,
} from '@/features/chat/chatApi';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import { isRecord } from '@/services/api';

function toErrorMessage(error: unknown): string | undefined {
    if (!isRecord(error)) return undefined;
    const data = isRecord(error.data) ? error.data : undefined;
    return (
        (typeof data?.message === 'string' ? data.message : undefined) ??
        (typeof error?.message === 'string' ? error.message : undefined)
    );
}

export default function LeadSuccessPage() {
    const { t, i18n } = useTranslation();
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const locale = getLocaleFromLanguage(i18n.language);

    const { data: lead, isLoading } = useLeadsByIdQuery(
        { id: leadId ?? '' },
        { skip: !leadId, pollingInterval: 15000 },
    );

    const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
    const { data: existingConversation } = useGetConversationByLeadIdQuery(
        leadId ?? '',
        { skip: !leadId },
    );

    // Animation state
    const [showContent, setShowContent] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 400);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenChat = async () => {
        if (!leadId) return;
        try {
            if (existingConversation) {
                navigate(`/client-dashboard/chat/${existingConversation.id}`);
                return;
            }
            const conversation = await createConversation({ leadId }).unwrap();
            navigate(`/client-dashboard/chat/${conversation.id}`);
        } catch (error: unknown) {
            toast.error(toErrorMessage(error) ?? 'Failed to open chat');
        }
    };

    const masterName = lead?.master?.user
        ? `${lead.master.user.firstName ?? ''} ${lead.master.user.lastName ?? ''}`.trim()
        : null;

    const masterCategory = lead?.master?.category?.name;
    const masterSlugOrId =
        lead?.master?.slug ||
        lead?.master?.encodedId ||
        lead?.master?.id ||
        lead?.masterId;
    const createdAt = lead?.createdAt ? new Date(lead.createdAt) : null;

    // Redirect if no leadId
    if (!leadId) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-muted-foreground">{t('leads.leadNotFound')}</p>
                <Button className="mt-4" onClick={() => navigate('/client-dashboard/leads')}>
                    {t('clientDashboard.myLeads')}
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
            {/* Success Hero */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-center mb-8"
            >
                {/* Animated checkmark */}
                <div className="relative mx-auto mb-6 h-24 w-24">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/30 dark:shadow-green-500/20"
                    />
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </motion.div>
                    {/* Pulse ring */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.5, repeat: 2 }}
                        className="absolute inset-0 rounded-full border-2 border-green-400"
                    />
                </div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
                >
                    {t('leadSuccess.title', 'Заявка отправлена!')}
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground text-base max-w-md mx-auto"
                >
                    {t('leadSuccess.subtitle', 'Мастер получил ваш запрос и скоро свяжется с вами.')}
                </motion.p>
            </motion.div>

            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Lead Details Card */}
                        <Card className="overflow-hidden border-border/50 dark:border-white/[0.08] shadow-lg">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                            <CardContent className="p-6 space-y-5">
                                {/* Status Progress */}
                                {!isLoading && lead && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                            {t('leadSuccess.currentStatus', 'Статус заявки')}
                                        </p>
                                        <LeadStatusProgress status={lead.status ?? 'NEW'} />
                                    </div>
                                )}

                                <Separator />

                                {/* Master Info */}
                                {!isLoading && lead && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t('leadSuccess.details', 'Детали заявки')}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {masterName && (
                                                <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-muted-foreground">{t('leadSuccess.master', 'Мастер')}</p>
                                                        <p className="text-sm font-semibold truncate">{masterName}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {masterCategory && (
                                                <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-muted-foreground">{t('leadSuccess.category', 'Категория')}</p>
                                                        <p className="text-sm font-semibold truncate">{masterCategory}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {createdAt && (
                                                <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-muted-foreground">{t('leadSuccess.sentAt', 'Отправлена')}</p>
                                                        <p className="text-sm font-semibold">
                                                            {formatDateShort(createdAt, locale)} {formatTimeOnly(createdAt, locale)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {lead.master?.user?.phone && (
                                                <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                                                        <Phone className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-muted-foreground">{t('leadSuccess.masterPhone', 'Телефон мастера')}</p>
                                                        <a href={`tel:${lead.master.user.phone}`} className="text-sm font-semibold hover:underline">
                                                            {lead.master.user.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {lead.message && (
                                            <div className="rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                                                <p className="text-[11px] text-muted-foreground mb-1">
                                                    {t('leadSuccess.yourMessage', 'Ваше сообщение')}
                                                </p>
                                                <p className="text-sm leading-relaxed">{lead.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="space-y-3">
                                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                        <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* What's Next Card */}
                        <Card className="border-border/50 dark:border-white/[0.08] shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-base font-bold">
                                        {t('leadSuccess.whatsNext', 'Что дальше?')}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: <Mail className="h-4 w-4" />,
                                            text: t('leadSuccess.step1', 'Мастер получил ваш запрос через SMS и уведомления'),
                                            bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                        },
                                        {
                                            icon: <Clock className="h-4 w-4" />,
                                            text: t('leadSuccess.step2', 'Обычно мастера отвечают в течение 1-2 часов'),
                                            bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                        },
                                        {
                                            icon: <MessageCircle className="h-4 w-4" />,
                                            text: t('leadSuccess.step3', 'Вы можете написать мастеру в чат прямо сейчас'),
                                            bg: 'bg-green-500/10 text-green-600 dark:text-green-400',
                                        },
                                    ].map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.7 + index * 0.15 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.bg}`}>
                                                {step.icon}
                                            </div>
                                            <p className="text-sm leading-relaxed">{step.text}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                size="lg"
                                className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                onClick={handleOpenChat}
                                disabled={isCreatingChat}
                            >
                                {isCreatingChat ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <MessageCircle className="h-4 w-4" />
                                )}
                                {t('leadSuccess.openChat', 'Написать мастеру в чат')}
                            </Button>

                            {leadId && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full gap-2 font-semibold"
                                    onClick={() => navigate(`/client-dashboard/leads/${leadId}/book`)}
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    {t('leadSuccess.bookTime', 'Выбрать время записи')}
                                </Button>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="gap-2 font-semibold"
                                    onClick={() => navigate('/client-dashboard/leads')}
                                >
                                    <ListChecks className="h-4 w-4" />
                                    {t('leadSuccess.myLeads', 'Мои заявки')}
                                </Button>

                                {masterSlugOrId && (
                                    <Button
                                        variant="outline"
                                        className="gap-2 font-semibold"
                                        asChild
                                    >
                                        <Link to={`/masters/${masterSlugOrId}`}>
                                            <ArrowRight className="h-4 w-4" />
                                            {t('leadSuccess.backToMaster', 'К мастеру')}
                                        </Link>
                                    </Button>
                                )}

                                {!masterSlugOrId && (
                                    <Button
                                        variant="outline"
                                        className="gap-2 font-semibold"
                                        onClick={() => navigate('/')}
                                    >
                                        <Home className="h-4 w-4" />
                                        {t('leadSuccess.home', 'На главную')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
