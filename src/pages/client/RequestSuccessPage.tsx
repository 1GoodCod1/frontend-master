import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  MessageCircle,
  CalendarDays,
  ListChecks,
  ArrowRight,
  Clock,
  User,
  Sparkles,
  Home,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RequestStatusProgress } from '@/features/requests/components/RequestStatusProgress';
import { useLeadsByIdQuery } from '@/features/leads/leadsApi';
import {
  useCreateConversationMutation,
  useGetConversationByLeadIdQuery,
} from '@/features/chat/chatApi';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import { isRecord } from '@/services/api';
import { cn } from '@/lib/utils';
import {
  clientCardStaticCls,
  clientFormLabelCls,
  clientIconWrapCls,
  clientOutlineBtnCls,
  clientPageNarrowClassName,
  clientPrimaryBtnCls,
  clientSectionTitleCls,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';

function toErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const data = isRecord(error.data) ? error.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof error?.message === 'string' ? error.message : undefined)
  );
}

const detailTileCls = cn(
  'flex items-center gap-3 rounded-xl border border-[#E9ECEF] bg-[#FAFBFC] p-3',
  'dark:border-white/10 dark:bg-white/[0.03]',
);

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className={detailTileCls}>
      <span className={clientIconWrapCls}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className={clientTextMuted}>{label}</p>
        <p className={cn('truncate text-sm font-semibold', clientTextTitle)}>{value}</p>
      </div>
    </div>
  );
}

export default function RequestSuccessPage() {
  const { t, i18n } = useTranslation();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const locale = getLocaleFromLanguage(i18n.language);

  const { data: lead, isLoading } = useLeadsByIdQuery(
    { id: leadId ?? '' },
    { skip: !leadId, pollingInterval: 15000 },
  );

  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
  const { data: existingConversation } = useGetConversationByLeadIdQuery(leadId ?? '', { skip: !leadId });

  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
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
    lead?.master?.slug || lead?.master?.encodedId || lead?.master?.id || lead?.masterId;
  const createdAt = lead?.createdAt ? new Date(lead.createdAt) : null;

  if (!leadId) {
    return (
      <div className={cn(clientPageNarrowClassName, 'py-12 text-center')}>
        <p className={clientTextMuted}>{t('leads.leadNotFound')}</p>
        <Button className={cn(clientPrimaryBtnCls, 'mt-4')} onClick={() => navigate('/client-dashboard/leads')}>
          {t('clientDashboard.myLeads')}
        </Button>
      </div>
    );
  }

  const nextSteps = [
    { icon: Mail, text: t('leadSuccess.step1', 'Мастер получил ваш запрос через SMS и уведомления') },
    { icon: Clock, text: t('leadSuccess.step2', 'Обычно мастера отвечают в течение 1-2 часов') },
    { icon: MessageCircle, text: t('leadSuccess.step3', 'Вы можете написать мастеру в чат прямо сейчас') },
  ];

  return (
    <div className={cn(clientPageNarrowClassName, 'faber-page-enter py-4 md:py-6')}>
      <div className="mb-6 text-center sm:mb-8">
        <div className={cn(clientIconWrapCls, 'mx-auto mb-4 size-16 rounded-2xl')}>
          <CheckCircle2 className="size-8 text-[#E97525]" strokeWidth={2.25} />
        </div>
        <h1 className={cn('mb-2 text-2xl font-bold tracking-tight md:text-3xl', clientTextTitle)}>
          {t('leadSuccess.title', 'Заявка отправлена!')}
        </h1>
        <p className={cn('mx-auto max-w-md', clientTextBody)}>
          {t('leadSuccess.subtitle', 'Мастер получил ваш запрос и скоро свяжется с вами.')}
        </p>
      </div>

      {showContent ? (
        <div className="faber-view-swap space-y-5 sm:space-y-6">
          <div className={clientCardStaticCls}>
            <CardContent className="space-y-5 p-5 sm:p-6">
              {!isLoading && lead ? (
                <div>
                  <p className={cn(clientFormLabelCls, 'mb-3 uppercase tracking-wide')}>
                    {t('leadSuccess.currentStatus', 'Статус заявки')}
                  </p>
                  <RequestStatusProgress status={lead.status ?? 'NEW'} />
                </div>
              ) : null}

              <Separator className="bg-[#E9ECEF] dark:bg-white/10" />

              {!isLoading && lead ? (
                <div className="space-y-3">
                  <p className={cn(clientFormLabelCls, 'uppercase tracking-wide')}>
                    {t('leadSuccess.details', 'Детали заявки')}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {masterName ? (
                      <DetailTile icon={User} label={t('leadSuccess.master', 'Мастер')} value={masterName} />
                    ) : null}
                    {masterCategory ? (
                      <DetailTile
                        icon={Sparkles}
                        label={t('leadSuccess.category', 'Категория')}
                        value={masterCategory}
                      />
                    ) : null}
                    {createdAt ? (
                      <DetailTile
                        icon={Clock}
                        label={t('leadSuccess.sentAt', 'Отправлена')}
                        value={`${formatDateShort(createdAt, locale)} ${formatTimeOnly(createdAt, locale)}`}
                      />
                    ) : null}
                  </div>

                  {lead.message ? (
                    <div className={detailTileCls}>
                      <p className={cn(clientTextMuted, 'mb-1 w-full')}>
                        {t('leadSuccess.yourMessage', 'Ваше сообщение')}
                      </p>
                      <p className={cn('w-full text-sm leading-relaxed', clientTextBody)}>{lead.message}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#E9ECEF] dark:bg-white/10" />
                  <div className="h-16 w-full animate-pulse rounded-xl bg-[#E9ECEF] dark:bg-white/10" />
                </div>
              ) : null}
            </CardContent>
          </div>

          <div className={clientCardStaticCls}>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className={clientIconWrapCls}>
                  <Sparkles className="size-4" />
                </span>
                <h3 className={clientSectionTitleCls}>{t('leadSuccess.whatsNext', 'Что дальше?')}</h3>
              </div>

              <ul className="space-y-3">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={cn(clientIconWrapCls, 'mt-0.5')}>
                      <step.icon className="size-4" />
                    </span>
                    <p className={cn('flex-1 pt-0.5', clientTextBody)}>{step.text}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              className={cn(clientPrimaryBtnCls, 'h-11 w-full')}
              onClick={handleOpenChat}
              disabled={isCreatingChat}
            >
              {isCreatingChat ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MessageCircle className="size-4" />
              )}
              {t('leadSuccess.openChat', 'Написать мастеру в чат')}
            </Button>

            {leadId ? (
              <Button
                type="button"
                variant="outline"
                className={cn(clientOutlineBtnCls, 'h-11 w-full')}
                onClick={() => navigate(`/client-dashboard/leads/${leadId}/book`)}
              >
                <CalendarDays className="size-4" />
                {t('leadSuccess.bookTime', 'Выбрать время записи')}
              </Button>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className={cn(clientOutlineBtnCls, 'w-full')}
                onClick={() => navigate('/client-dashboard/leads')}
              >
                <ListChecks className="size-4" />
                {t('leadSuccess.myLeads', 'Мои заявки')}
              </Button>

              {masterSlugOrId ? (
                <Button type="button" variant="outline" className={cn(clientOutlineBtnCls, 'w-full')} asChild>
                  <Link to={`/masters/${masterSlugOrId}`}>
                    <ArrowRight className="size-4" />
                    {t('leadSuccess.backToMaster', 'К мастеру')}
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className={cn(clientOutlineBtnCls, 'w-full')}
                  onClick={() => navigate('/')}
                >
                  <Home className="size-4" />
                  {t('leadSuccess.home', 'На главную')}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
