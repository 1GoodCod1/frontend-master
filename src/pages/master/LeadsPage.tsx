import { useEffect, useMemo, useState, useCallback } from 'react';
import { Filter, Download } from 'lucide-react';
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
import { LeadCard } from '@/features/leads/components/LeadCard';
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
import { getLocaleFromLanguage } from '@/utils/date';
import { LEAD_STATUS_OPTIONS, type LeadStatus, type LeadFilterStatus, type LeadDto } from '@/types/leads';

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

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [updateStatus, { isLoading: isUpdating }] = useLeadsUpdateStatusMutation();

  const isRecent = useCallback(
    (id: string) => {
      const ts = recentMap?.[id];
      if (!ts) return false;
      return Date.now() - ts < RECENT_TTL;
    },
    [recentMap],
  );

  const onChangeStatus = async (lead: { id: string; encodedId?: string | null }, next: LeadStatus) => {
    const id = (lead as LeadDto).encodedId ?? lead.id;
    try {
      await updateStatus({ id, body: { status: next } }).unwrap();
      toast.success(t('leads.statusUpdated'));
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
                const leadId = (lead as LeadDto).encodedId ?? lead.id;
                return (
                  <div
                    key={lead.id}
                    className={cn(
                      index === 0 ? 'pb-2' : 'py-2',
                      index < items.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div
                      className={cn(
                        isRecent(String(lead.id)) && 'ring-1 ring-amber-500/20 dark:ring-amber-500/10 rounded-xl'
                      )}
                      onMouseEnter={() => {
                        if (leadId) {
                          dispatch(leadsApi.util.prefetch('leadsById', { id: String(leadId) }, { force: false }));
                        }
                      }}
                    >
                      <LeadCard
                        lead={{ ...lead, id: String(lead?.id ?? '') }}
                        locale={locale}
                        isUpdating={isUpdating}
                        onStatusChange={onChangeStatus}
                        onOpenDetails={(l) => nav(`/dashboard/leads/${(l as LeadDto).encodedId ?? l.id}`)}
                        variant="list"
                      />
                    </div>
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
