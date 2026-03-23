import { useEffect, useMemo, useState, useCallback } from 'react';
import { Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearUnreadLeads, RECENT_TTL } from '@/features/socket/socketSlice';
import { leadsApi, useLeadsMyListQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { selectPlan } from '@/features/auth/selectors';
import { exportService } from '@/features/export/exportApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequestCard } from '@/features/requests/components/RequestCard';
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
import { LEAD_STATUS_OPTIONS, type LeadStatus, type LeadFilterStatus } from '@/types/leads';
import { extractItems } from '@/utils/data';

const ITEMS_PER_PAGE = 3;

export default function RequestsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<LeadFilterStatus>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(clearUnreadLeads());
  }, [dispatch]);

  const onStatusChange = useCallback((v: string) => {
    setStatus(v as LeadFilterStatus);
    setPage(1);
  }, []);

  const recentMap = useAppSelector((s) => s.socket.recent.leads);
  const plan = useAppSelector(selectPlan) ?? 'BASIC';
  const isPremium = plan === 'PREMIUM';

  const myProfile = useMastersMyProfileQuery();
  const masterId = (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ?? (myProfile.data as { id?: string })?.id ?? null;
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);

  const params = useMemo(() => (status === 'ALL' ? undefined : { status }), [status]);

  const { data, isLoading, isError, error, refetch } = useLeadsMyListQuery(params);
  const items = extractItems(data) as { id?: string; clientName?: string; clientPhone?: string; createdAt?: string; message?: string; status?: string }[];
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const displayedItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

  const onChangeStatus = async (lead: { id: string }, next: LeadStatus) => {
    const id = lead.id;
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
    <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-6 md:py-8 md:px-6 lg:px-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <PageHeader title={t('leads.title')} subtitle={t('leads.subtitle')} />
      </div>

      <Card className="overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4 md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Filter className="size-4" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">{t('leads.myLeads')}</h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="w-full sm:w-auto">
              <Label className="sr-only">{t('leads.status')}</Label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full sm:min-w-[140px] h-9 sm:h-8 rounded-lg border-slate-200 dark:border-white/[0.08] bg-white dark:bg-black/40">
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
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    try {
                      await exportService.exportLeadsCSV(masterId, accessToken ?? undefined);
                      toast.success(t('export.leadsCSVSuccess'));
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : t('export.exportFailed'));
                    }
                  }}
                  aria-label={t('export.exportCSV')}
                  className="h-9 sm:h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 flex-1 sm:flex-initial min-w-0"
                >
                  <Download className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('export.exportCSV')}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    void toast.promise(
                      exportService.exportLeadsExcel(masterId, accessToken ?? undefined),
                      {
                        loading: t('export.excelPreparing'),
                        success: t('export.leadsExcelSuccess'),
                        error: (e) =>
                          e instanceof Error ? e.message : t('export.exportFailed'),
                      },
                    );
                  }}
                  aria-label={t('export.exportExcel')}
                  className="h-9 sm:h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 flex-1 sm:flex-initial min-w-0"
                >
                  <Download className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('export.exportExcel')}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardContent className="px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
          {items.length === 0 ? (
            <EmptyState title={t('leads.noLeadsYet')} description={t('leads.noLeadsDescription')} />
          ) : (
            <>
              <div className="space-y-0">
                {displayedItems.map((lead, index) => {
                  const leadId = lead.id;
                  return (
                    <div
                      key={lead.id}
                      className={cn(
                        index === 0 ? 'pb-3 sm:pb-2' : 'py-3 sm:py-2',
                        index < displayedItems.length - 1 && 'border-b border-border'
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
                      <RequestCard
                        lead={{ ...lead, id: String(lead?.id ?? '') }}
                        locale={locale}
                        isUpdating={isUpdating}
                        onStatusChange={onChangeStatus}
                        onOpenDetails={(l) => nav(`/dashboard/leads/${l.id}`)}
                        variant="list"
                      />
                    </div>
                  </div>
                );
              })}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="order-2 sm:order-1 min-h-[44px] sm:min-h-0 border-slate-200 dark:border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 touch-manipulation"
                  >
                    {t('common.prev')}
                  </Button>
                  <span className="order-1 sm:order-2 px-3 py-2 sm:py-1.5 rounded-lg bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400 text-sm text-center">
                    {t('common.page')} {currentPage} {t('common.pageOf', { total: totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="order-3 min-h-[44px] sm:min-h-0 border-slate-200 dark:border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 touch-manipulation"
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
