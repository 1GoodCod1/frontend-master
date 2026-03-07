import { useEffect, useMemo, useState, useCallback } from 'react';
import { ExternalLink, User, Phone, Clock, Filter, Download, AlertCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearUnreadLeads, RECENT_TTL } from '@/features/socket/socketSlice';
import { leadsApi, useLeadsMyListQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { selectPlan } from '@/features/auth/selectors';
import { exportService } from '@/features/export/exportApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { LEAD_STATUS_OPTIONS, type LeadStatus, type LeadFilterStatus, type LeadDto } from '@/types/leads';
import { LeadStatusProgress } from '@/features/leads/components/LeadStatusProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

function extractItems(resp: unknown): unknown[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (!root || typeof root !== 'object') return [];

  if (Array.isArray(root)) return root;
  const r = root as { items?: unknown[]; rows?: unknown[] };
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.rows)) return r.rows;

  const nested = (root as { data?: unknown; result?: unknown }).data ?? (root as { result?: unknown }).result ?? null;
  if (Array.isArray(nested)) return nested;
  if (nested && typeof nested === 'object' && Array.isArray((nested as { items?: unknown[] }).items)) {
    return (nested as { items: unknown[] }).items;
  }
  return [];
}

export default function LeadsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<LeadFilterStatus>('ALL');

  useEffect(() => {
    dispatch(clearUnreadLeads());
  }, [dispatch]);

  const recentMap = useAppSelector((s) => s.socket.recent.leads);
  const plan = useAppSelector(selectPlan) ?? 'BASIC';
  const isPremium = plan === 'PREMIUM';

  const myProfile = useMastersMyProfileQuery();
  const masterId = (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ?? (myProfile.data as { id?: string })?.id ?? null;
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);

  const params = useMemo(() => (status === 'ALL' ? undefined : { status }), [status]);

  const { data, isLoading, isError, error, refetch } = useLeadsMyListQuery(params);
  const items = extractItems(data) as { id?: string; clientName?: string; clientPhone?: string; createdAt?: string; message?: string; status?: string }[];

  const [updateStatus, { isLoading: isUpdating }] = useLeadsUpdateStatusMutation();

  const isRecent = useCallback(
    (id: string) => {
      const ts = recentMap?.[id];
      if (!ts) return false;
      return Date.now() - ts < RECENT_TTL;
    },
    [recentMap],
  );

  const onChangeStatus = async (id: string, next: LeadStatus) => {
    try {
      await updateStatus({ id, body: { status: next } }).unwrap();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (e instanceof Error ? e.message : t('leads.updateStatusFailed')));
    }
  };

  if (isLoading) return <LoadingState label={t('leads.loadingLeads')} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('leads.title')} subtitle={t('leads.subtitle')} />
      </div>

      <Card className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Filter className="size-4" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('leads.myLeads')}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="sr-only">{t('leads.status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LeadFilterStatus)}>
                <SelectTrigger className="min-w-[140px] h-8 rounded-lg border-slate-200 dark:border-white/[0.08] bg-white dark:bg-black/40">
                  <SelectValue placeholder={t('leads.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {LEAD_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`leads.${s.toLowerCase()}` as 'leads.new' | 'leads.in_progress' | 'leads.closed' | 'leads.spam')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isPremium && masterId && (
              <>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await exportService.exportLeadsCSV(masterId, accessToken ?? undefined);
                      toast.success(t('export.leadsCSVSuccess'));
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : t('export.exportFailed'));
                    }
                  }}
                  className="h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  <Download className="size-3.5" />
                  {t('export.exportCSV')}
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await exportService.exportLeadsExcel(masterId, accessToken ?? undefined);
                      toast.success(t('export.leadsExcelSuccess'));
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : t('export.exportFailed'));
                    }
                  }}
                  className="h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  <Download className="size-3.5" />
                  {t('export.exportExcel')}
                </Button>
              </>
            )}
          </div>
        </div>

        <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
          {items.length === 0 ? (
            <EmptyState title={t('leads.noLeadsYet')} description={t('leads.noLeadsDescription')} />
          ) : (
            <Virtuoso
              useWindowScroll
              totalCount={items.length}
              itemContent={(index) => {
                const lead = items[index];
                const isClosed = lead?.status === 'CLOSED' || lead?.status === 'SPAM';

                return (
                  <div className={index === 0 ? 'pb-2' : 'py-2'}>
                    <Card
                      key={lead.id}
                      className={cn(
                        'group relative overflow-hidden transition-all duration-300',
                        'rounded-xl border border-slate-200 dark:border-white/[0.08]',
                        'bg-white dark:bg-[#0c0c0e]',
                        'hover:border-amber-500/30 dark:hover:border-amber-500/30',
                        isRecent(String(lead.id)) && 'ring-1 ring-amber-500/20 dark:ring-amber-500/10',
                        isClosed && 'opacity-80'
                      )}
                      onMouseEnter={() => {
                        if (lead?.id) {
                          dispatch(leadsApi.util.prefetch('leadsById', { id: String(lead.id) }, { force: false }));
                        }
                      }}
                    >
                      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                        {/* Header: Avatar + Info + Status (like LeadDetailsDialog) */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              <User className="size-5" />
                            </div>
                            <div className="flex flex-col justify-center space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="truncate text-lg font-semibold text-foreground">
                                  {lead?.clientName || t('leads.client')}
                                </h3>
                                <div className="sm:hidden shrink-0">
                                  <StatusChip kind="lead" value={lead?.status} />
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                {lead?.clientPhone && (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    {lead.clientPhone}
                                  </span>
                                )}
                                {lead?.createdAt && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    {formatDateTimeString(lead.createdAt, locale)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <div className="hidden sm:block">
                              <StatusChip kind="lead" value={lead?.status} />
                            </div>
                            <Select
                              value={(lead?.status as LeadStatus) ?? 'NEW'}
                              onValueChange={(v) => onChangeStatus(String(lead.id), v as LeadStatus)}
                              disabled={isUpdating || isClosed}
                            >
                              <SelectTrigger className="h-8 w-[140px] rounded-lg border-slate-200 dark:border-white/[0.08]">
                                <SelectValue placeholder={t('leads.setStatus')} />
                              </SelectTrigger>
                              <SelectContent>
                                {LEAD_STATUS_OPTIONS.filter((s) => s !== 'SPAM').map((s) => (
                                  <SelectItem key={s} value={s} className="cursor-pointer">
                                    {t(`leads.${s.toLowerCase()}` as 'leads.new' | 'leads.in_progress' | 'leads.closed' | 'leads.spam')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="max-w-md">
                          <LeadStatusProgress status={lead?.status} compact />
                        </div>

                        {/* Message (like LeadDetailsDialog) */}
                        {lead?.message && (
                          <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <p className="text-sm font-semibold text-foreground">{t('leads.message')}</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                              {lead.message}
                            </p>
                          </div>
                        )}

                        {/* Actions (like LeadDetailsDialog buttons) */}
                        {lead?.id && (
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <Button
                              size="sm"
                              onClick={() => nav(`/dashboard/leads/${(lead as LeadDto).encodedId ?? lead.id}`)}
                              className="h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                            >
                              <ExternalLink className="size-3.5" />
                              {t('leads.open')}
                            </Button>
                            {!isClosed && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (window.confirm(t('leads.confirmSpam'))) {
                                    onChangeStatus(String(lead.id), 'SPAM');
                                  }
                                }}
                                className="h-8 gap-1.5 px-3 text-sm text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                              >
                                <AlertCircle className="size-3.5" />
                                <span className="hidden sm:inline">{t('leads.markAsSpam')}</span>
                                <span className="sm:hidden">{t('leads.spamLabel')}</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
