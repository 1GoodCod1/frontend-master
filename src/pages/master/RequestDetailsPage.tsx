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
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { Card, CardContent } from '@/components/ui/card';
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

  const files = Array.isArray(lead?.files) ? lead.files : [];

  const client = lead?.client as Record<string, string> | undefined;
  const fromClient = client
    ? [client.firstName, client.lastName].filter(Boolean).join(' ').trim()
    : '';
  const clientName: string =
    (typeof lead?.clientName === 'string' && lead.clientName.trim()) || fromClient || String(t('leads.client'));

  const leadForCard = {
    ...lead,
    id: String(lead?.id ?? ''),
    clientName,
    clientPhone: (lead?.clientPhone && typeof lead.clientPhone === 'string') ? lead.clientPhone : undefined,
    createdAt: (lead?.createdAt && typeof lead.createdAt === 'string') ? lead.createdAt : undefined,
    message: (lead?.message && typeof lead.message === 'string') ? lead.message : undefined,
    status: (lead?.status && typeof lead.status === 'string') ? lead.status : undefined,
  };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
      <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader
          title={t('leads.leadDetailsTitle', { id: String(lead?.id ?? '') })}
          subtitle={lead?.createdAt ? formatDateTimeString(lead.createdAt as string, getLocaleFromLanguage(i18n.language)) : ''}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="gap-2 border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-transparent dark:text-amber-400 dark:hover:bg-white/[0.05]">
                <RouterLink to="/dashboard/leads">
                  <ArrowLeft className="size-4" />
                  {t('common.back')}
                </RouterLink>
              </Button>
              <Button onClick={handleOpenChat} disabled={isCreatingChat} className="gap-2 border-0 font-semibold bg-amber-600 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-lg dark:bg-amber-700 dark:hover:bg-amber-600">
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
      </div>

      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
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
          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300 sticky top-6">
            {sectionHeader(
              <Filter className="size-5" />,
              t('leads.management'),
              t('leads.manageStatusSubtitle')
            )}
            <CardContent className="space-y-6 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/[0.05]">
                <StatusChip kind="lead" value={status as string} />
                {typeof lead?.spamScore === 'number' && (
                  <Badge variant="secondary" className="font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-0">
                    {String(t('leads.spamScore', { score: lead.spamScore }))}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
