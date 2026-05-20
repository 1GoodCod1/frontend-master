import { useEffect, useMemo, useState, useCallback } from 'react';
import { Download, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearUnreadLeads, RECENT_TTL } from '@/features/socket/socketSlice';
import { leadsApi, useLeadsMyListQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { selectPlan } from '@/features/auth/selectors';
import { exportService } from '@/features/export/exportApi';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { PageHeader } from '@/components/ui/PageHeader';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { RequestCard } from '@/features/requests/components/RequestCard';
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
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterOutlineBtnCls,
  masterPageClassName,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
  masterSelectTriggerCls,
} from '@/lib/masterCabinetStyles';
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
  const isPro = plan === 'PRO';

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

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className={masterPageClassName}>
      <PageHeader title={t('leads.title')} subtitle={t('leads.subtitle')} />

      <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
        <div className="flex flex-col gap-4 border-b border-[#e8e8e8] px-4 py-4 dark:border-[#2d2d2d] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className={masterIconWrapCls}>
              <Inbox className="size-4" />
            </div>
            <h2 className={masterSectionTitleCls}>{t('leads.myLeads')}</h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="w-full sm:w-auto">
              <Label className="sr-only">{t('leads.status')}</Label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className={cn(masterSelectTriggerCls, 'w-full sm:min-w-[140px]')}>
                  <SelectValue placeholder={t('leads.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {LEAD_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`leads.${s.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isPro && masterId && (
              <div className="flex flex-wrap gap-2">
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
                  className={cn(masterPrimaryBtnCls, 'h-9 sm:h-8 flex-1 sm:flex-initial min-w-0')}
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
                  className={cn(masterPrimaryBtnCls, 'h-9 sm:h-8 flex-1 sm:flex-initial min-w-0')}
                >
                  <Download className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('export.exportExcel')}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {items.length === 0 ? (
            <CabinetEmptyState
              icon={Inbox}
              title={t('leads.noLeadsYet')}
              description={t('leads.noLeadsDescription')}
            />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {displayedItems.map((lead) => {
                  const leadId = lead.id;
                  return (
                    <div
                      key={lead.id}
                      className={cn(
                        isRecent(String(lead.id)) && 'rounded-[18px] ring-1 ring-[#E97525]/25',
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
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-[#e8e8e8] pt-4 dark:border-[#2d2d2d] sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(masterOutlineBtnCls, 'order-2 h-10 sm:order-1')}
                  >
                    {t('common.prev')}
                  </Button>
                  <span className="order-1 rounded-[10px] bg-[#FFF8EB] px-3 py-2 text-center text-sm font-medium text-[#E97525] dark:bg-[#E97525]/12 sm:order-2">
                    {t('common.page')} {currentPage} {t('common.pageOf', { total: totalPages })}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={cn(masterOutlineBtnCls, 'order-3 h-10')}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
