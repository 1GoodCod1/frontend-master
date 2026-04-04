import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  MessageCircle,
  CalendarDays,
  ListChecks,
  Clock,
  User,
  Sparkles,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLeadsByIdQuery } from '@/features/leads/leadsApi';
import {
  useCreateConversationMutation,
  useGetConversationByLeadIdQuery,
} from '@/features/chat/chatApi';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { isRecord } from '@/services/api';

function toErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const data = isRecord(error.data) ? error.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof error?.message === 'string' ? error.message : undefined)
  );
}

export default function BookingSuccessPage() {
  const { t, i18n } = useTranslation();
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locale = getLocaleFromLanguage(i18n.language);

  const bookedDate = searchParams.get('date');
  const bookedTime = searchParams.get('time');

  const { data: lead, isLoading } = useLeadsByIdQuery(
    { id: leadId ?? '' },
    { skip: !leadId },
  );

  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
  const { data: existingConversation } = useGetConversationByLeadIdQuery(
    leadId ?? '',
    { skip: !leadId },
  );

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

  if (!leadId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t('leads.leadNotFound')}</p>
        <Button className="mt-4" onClick={() => navigate('/client-dashboard/bookings')}>
          {t('bookings.myBookings')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="text-center mb-8 faber-page-enter">
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/30 dark:shadow-green-500/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          {t('bookingSuccess.title')}
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          {t('bookingSuccess.subtitle')}
        </p>
      </div>

      {showContent && (
          <div className="space-y-6 faber-view-swap">
            <Card className="overflow-hidden border-border/50 dark:border-white/[0.08] shadow-lg">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="p-6 space-y-5">
                {!isLoading && lead && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('bookingSuccess.details')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {masterName && (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">{t('bookingSuccess.master')}</p>
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
                            <p className="text-[11px] text-muted-foreground">{t('bookingSuccess.category')}</p>
                            <p className="text-sm font-semibold truncate">{masterCategory}</p>
                          </div>
                        </div>
                      )}

                      {bookedDate && (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">{t('bookingSuccess.date')}</p>
                            <p className="text-sm font-semibold">
                              {formatDateShort(new Date(bookedDate), locale)}
                            </p>
                          </div>
                        </div>
                      )}

                      {bookedTime && (
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">{t('bookingSuccess.time')}</p>
                            <p className="text-sm font-semibold">{bookedTime}</p>
                          </div>
                        </div>
                      )}
                    </div>
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

            <Card className="border-border/50 dark:border-white/[0.08] shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold">
                    {t('bookingSuccess.whatsNext')}
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: <CheckCircle2 className="h-4 w-4" />,
                      text: t('bookingSuccess.step1'),
                      bg: 'bg-green-500/10 text-green-600 dark:text-green-400',
                    },
                    {
                      icon: <Clock className="h-4 w-4" />,
                      text: t('bookingSuccess.step2'),
                      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    },
                    {
                      icon: <MessageCircle className="h-4 w-4" />,
                      text: t('bookingSuccess.step3'),
                      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="faber-page-enter flex items-center gap-3"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.bg}`}>
                        {step.icon}
                      </div>
                      <p className="text-sm leading-relaxed">{step.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
                onClick={handleOpenChat}
                disabled={isCreatingChat}
              >
                {isCreatingChat ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {t('bookingSuccess.openChat')}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2 font-semibold"
                  onClick={() => navigate('/client-dashboard/bookings')}
                >
                  <ListChecks className="h-4 w-4" />
                  {t('bookings.myBookings')}
                </Button>

                <Button
                  variant="outline"
                  className="gap-2 font-semibold"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4" />
                  {t('bookingSuccess.home')}
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
