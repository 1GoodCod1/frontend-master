import {
  ArrowLeft,
  MessageCircle,
  Loader2,
  Filter,
} from 'lucide-react';

import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLeadsByIdQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { useCreateConversationMutation, useGetConversationByLeadIdQuery } from '@/features/chat/chatApi';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { RequestFilesGallery } from '@/features/requests/components/RequestFilesGallery';
import type { LeadStatus } from '@/types/leads';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterInsetPanelCls,
  masterOutlineBtnCls,
  masterPageClassName,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function unwrapLead(data: unknown): Record<string, unknown> | undefined {
  const d = data as { data?: unknown } | undefined;
  return (d?.data ?? d) as Record<string, unknown> | undefined;
}

export default function RequestDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const leadId = id ?? '';

  const q = useLeadsByIdQuery(
    { id: leadId },
    { skip: !leadId, refetchOnMountOrArgChange: true },
  );
  const { data: existingConversation } = useGetConversationByLeadIdQuery(leadId, { skip: !leadId });
  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useLeadsUpdateStatusMutation();

  const lead = unwrapLead(q.data);
  const status = lead?.status;

  const onChangeStatus = async (next: LeadStatus, leadRef?: { id?: string }) => {
    const id = leadRef ? leadRef.id ?? leadId : leadId;
    if (!id) return;
    try {
      await updateStatus({ id, body: { status: next } }).unwrap();
      toast.success(t('leads.statusUpdated'));
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (e instanceof Error ? e.message : t('leads.updateStatusFailed')));
    }
  };

  const handleOpenChat = async () => {
    try {
      if (existingConversation) {
        navigate(`/dashboard/chat/${(existingConversation as { id: string }).id}`);
        return;
      }
      const conversation = await createConversation({ leadId }).unwrap();
      navigate(`/dashboard/chat/${(conversation as { id: string }).id}`);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || 'Failed to open chat');
    }
  };

  if (!leadId) {
    return <ErrorState error={{ message: t('leads.invalidLeadId') } as Error} onRetry={() => { }} />;
  }
  if (q.isLoading) return <LoadingState label={t('leads.loadingLead')} />;
  if (q.isError) return <ErrorState error={q.error as Error} onRetry={q.refetch} />;
  if (!lead) {
    return <ErrorState error={{ message: t('leads.leadNotFound') } as Error} onRetry={q.refetch} />;
  }

  const files = Array.isArray(lead.files) ? lead.files : [];

  const client = lead.client as Record<string, string> | undefined;
  const fromClient = client
    ? [client.firstName, client.lastName].filter(Boolean).join(' ').trim()
    : '';
  const clientName: string =
    (typeof lead.clientName === 'string' && lead.clientName.trim()) || fromClient || String(t('leads.client'));

  const leadForCard = {
    ...lead,
    id: String(lead.id ?? ''),
    clientName,
    clientPhone: typeof lead.clientPhone === 'string' ? lead.clientPhone : undefined,
    createdAt: typeof lead.createdAt === 'string' ? lead.createdAt : undefined,
    message: typeof lead.message === 'string' ? lead.message : undefined,
    status: typeof lead.status === 'string' ? lead.status : undefined,
  };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className="flex items-center gap-3 border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
      <span className={masterIconWrapCls}>{icon}</span>
      <div>
        <h2 className={masterSectionTitleCls}>{title}</h2>
        <p className={masterTextMuted}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className={masterPageClassName}>
      <PageHeader
          title={t('leads.leadDetailsTitle', { id: String(lead.id ?? '') })}
          subtitle={typeof lead.createdAt === 'string' ? formatDateTimeString(lead.createdAt, getLocaleFromLanguage(i18n.language)) : ''}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className={cn(masterOutlineBtnCls, 'gap-2')}>
                <RouterLink to="/dashboard/leads">
                  <ArrowLeft className="size-4" />
                  {t('common.back')}
                </RouterLink>
              </Button>
              <Button onClick={handleOpenChat} disabled={isCreatingChat} className={cn(masterPrimaryBtnCls, 'gap-2')}>
                {isCreatingChat ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MessageCircle className="size-4" />
                )}
                {existingConversation ? t('leads.openChat') : t('leads.startChat')}
              </Button>
            </div>
          }
        />

      <div className="grid min-w-0 grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8 flex flex-col gap-6 md:gap-8">
          <RequestCard
            lead={leadForCard}
            locale={getLocaleFromLanguage(i18n.language)}
            isUpdating={isUpdatingStatus}
            onStatusChange={(leadRef, nextStatus) => onChangeStatus(nextStatus, leadRef)}
            variant="detail"
          />

          <RequestFilesGallery files={files} sectionHeader={sectionHeader} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
          <div className={cn(masterCardStaticCls, 'sticky top-6 overflow-hidden')}>
            {sectionHeader(
              <Filter className="size-5" />,
              t('leads.management'),
              t('leads.manageStatusSubtitle')
            )}
            <CardContent className="space-y-6 px-6 py-6 sm:px-8">
              <div className={cn(masterInsetPanelCls, 'flex flex-wrap items-center gap-3')}>
                <StatusChip kind="lead" value={status as string} />
                {typeof lead.spamScore === 'number' && (
                  <Badge variant="secondary" className="font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-0">
                    {String(t('leads.spamScore', { score: lead.spamScore }))}
                  </Badge>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
