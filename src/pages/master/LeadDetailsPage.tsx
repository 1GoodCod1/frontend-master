import {
  ArrowLeft,
  User,
  Phone,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Copy,
  MessageCircle,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';

import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLeadsByIdQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { useCreateConversationMutation, useGetConversationByLeadIdQuery } from '@/features/chat/chatApi';
import { LeadStatusProgress } from '@/components/leads/LeadStatusProgress';
import { LEAD_STATUS_OPTIONS, type LeadStatus } from '@/types/leads';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import { decodeId } from '@/utils/id-encoder';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function unwrapLead(data: unknown): Record<string, unknown> | undefined {
  const d = data as { data?: unknown } | undefined;
  return (d?.data ?? d) as Record<string, unknown> | undefined;
}

export default function LeadDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const encodedId = id ?? '';
  const decodedId = decodeId(encodedId);
  const leadId = decodedId || encodedId;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leadId);
  const isValidId = isUuid || decodedId !== null;

  const q = useLeadsByIdQuery({ id: leadId }, { skip: !isValidId });
  const { data: existingConversation } = useGetConversationByLeadIdQuery(leadId, { skip: !isValidId });
  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useLeadsUpdateStatusMutation();

  const lead = unwrapLead(q.data);
  const status = lead?.status;

  const onChangeStatus = async (next: LeadStatus) => {
    if (!leadId) return;
    try {
      await updateStatus({ id: leadId, body: { status: next } }).unwrap();
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

  if (!leadId || !isValidId) {
    return <ErrorState error={{ message: t('leads.invalidLeadId') } as Error} onRetry={() => { }} />;
  }
  if (q.isLoading) return <LoadingState label={t('leads.loadingLead')} />;
  if (q.isError) return <ErrorState error={q.error as Error} onRetry={q.refetch} />;

  const files = Array.isArray(lead?.files) ? lead.files : [];
  const isClosed = status === 'CLOSED' || status === 'SPAM';

  const client = lead?.client as Record<string, string> | undefined;
  const fromClient = client
    ? [client.firstName, client.lastName].filter(Boolean).join(' ').trim()
    : '';
  const clientName: string =
    (typeof lead?.clientName === 'string' && lead.clientName.trim()) || fromClient || String(t('leads.client'));

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
          title={t('leads.leadDetailsTitle', { id: String(lead?.id ?? '').slice(0, 8) })}
          subtitle={lead?.createdAt ? formatDateTimeString(lead.createdAt as string, getLocaleFromLanguage(i18n.language)) : ''}
          crumbs={[
            { label: t('dashboard.title'), to: '/dashboard' },
            { label: t('leads.title'), to: '/dashboard/leads' },
            { label: t('leads.details') },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="gap-2 border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-transparent dark:text-amber-400 dark:hover:bg-white/[0.05]">
                <RouterLink to="/dashboard/leads">
                  <ArrowLeft className="size-4" />
                  {t('common.back')}
                </RouterLink>
              </Button>
              <Button onClick={handleOpenChat} disabled={isCreatingChat} className="gap-2 border-0 font-semibold bg-amber-600 text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-lg dark:bg-amber-700 dark:hover:bg-amber-600">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
            {sectionHeader(
              <User className="size-5" />,
              t('leads.client'),
              t('leads.contactDetails')
            )}
            <CardContent className="space-y-5 px-6 py-6 sm:px-8">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{String(clientName)}</h3>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium group cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors w-max">
                  <Phone className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>{String(lead?.clientPhone ?? '—')}</span>
                </div>
              </div>

              <div className="pt-2 max-w-sm">
                <LeadStatusProgress status={status as string} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
            {sectionHeader(
              <MessageSquare className="size-5" />,
              t('leads.message'),
              t('leads.clientRequest')
            )}
            <CardContent className="px-6 py-6 sm:px-8">
              <div className="rounded-xl border border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.04] p-5 shadow-inner">
                <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700 dark:text-slate-300 text-lg">
                  {String(lead?.message ?? '—')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
            {sectionHeader(
              <Paperclip className="size-5" />,
              t('leads.files'),
              t('leads.attachmentsCount', { current: files.length, limit: 10 })
            )}
            <CardContent className="px-6 py-6 sm:px-8">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 dark:bg-white/[0.04] rounded-xl border border-dashed border-slate-200 dark:border-white/[0.12]">
                  <Paperclip className="size-8 text-slate-400 dark:text-slate-600 mb-3 opacity-50" />
                  <p className="font-medium text-slate-500 dark:text-slate-400">{t('leads.noFilesAttached')}</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {files.map((x: unknown) => {
                    const item = x as { file?: Record<string, unknown>; id?: string };
                    const f = item?.file ?? item;
                    const file = f as { path?: string; mimetype?: string; filename?: string; size?: number; id?: string };
                    const url = mediaUrl(file?.path);
                    const isImage =
                      typeof file?.mimetype === 'string'
                        ? file.mimetype.startsWith('image/')
                        : /\.(png|jpe?g|webp|gif)$/i.test(String(file?.path));

                    return (
                      <Card key={file?.id ?? item?.id} className="overflow-hidden border border-slate-200 dark:border-white/[0.08] transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg group">
                        {isImage ? (
                          <button
                            type="button"
                            className="block w-full cursor-pointer border-0 bg-slate-100 dark:bg-neutral-900 p-0 overflow-hidden relative"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <img
                              src={url}
                              alt={file?.filename ?? 'file'}
                              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="flex h-48 w-full items-center justify-center bg-slate-50 dark:bg-muted/50 transition-colors hover:bg-slate-100 dark:hover:bg-muted"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Paperclip className="size-12 text-slate-400 dark:text-muted-foreground opacity-60" />
                              <span className="max-w-[220px] truncate px-4 text-sm font-medium text-slate-600 dark:text-muted-foreground" title={file?.filename}>
                                {file?.filename ?? 'Attachment'}
                              </span>
                            </div>
                          </button>
                        )}
                        <div className="space-y-3 p-4 bg-white dark:bg-black/40">
                          <div>
                            <p className="truncate text-[15px] font-bold text-slate-900 dark:text-slate-100" title={file?.filename}>
                              {file?.filename ?? 'Attachment'}
                            </p>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                              {typeof file?.size === 'number' ? `${Math.round(file.size / 1024)} KB` : '—'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-1 border-0 font-semibold bg-amber-600 text-white shadow-sm transition-all hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <ExternalLink className="size-3.5" />
                              {t('common.open')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 font-semibold border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                toast.success(t('common.copied'));
                              }}
                            >
                              <Copy className="size-3.5" />
                              {t('common.copy')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 sticky top-6">
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

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('leads.currentStatus')}</h4>
                <Select
                  value={(status as LeadStatus) ?? 'NEW'}
                  onValueChange={(v) => onChangeStatus(v as LeadStatus)}
                  disabled={isUpdatingStatus || isClosed}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-white/[0.12] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-sm hover:border-slate-300 transition-colors h-11">
                    <SelectValue placeholder={t('leads.setStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_OPTIONS.filter(s => s !== 'SPAM').map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`leads.${s.toLowerCase()}` as 'leads.new' | 'leads.in_progress' | 'leads.closed' | 'leads.spam')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isClosed && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic pt-2 font-medium">
                    {t('leads.statusLocked')}
                  </p>
                )}
              </div>

              {!isClosed && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(t('leads.confirmSpam'))) {
                        onChangeStatus('SPAM');
                      }
                    }}
                    className="w-full gap-2 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50 shadow-sm font-semibold h-11 transition-colors"
                  >
                    <AlertCircle className="size-4" />
                    {t('leads.markAsSpam')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
