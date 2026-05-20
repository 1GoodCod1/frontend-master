import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useReportsMyQuery, useReportsCreateMutation } from '@/features/reports/reportsApi';
import { useLeadsMyListQuery } from '@/features/leads/leadsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { getStatusColor } from '@/utils/reports';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';
import {
  clientCardCls,
  clientCardStaticCls,
  clientIconWrapCls,
  clientInsetPanelCls,
  clientPageClassName,
  clientPrimaryBtnCls,
  clientSectionTitleCls,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { isRecord } from '@/utils/guards';

type MasterForReport = { id: string; user?: { firstName?: string; lastName?: string }; category?: Record<string, unknown> };
type ReportItem = {
  id: string;
  status?: string;
  createdAt?: string;
  reason?: string;
  description?: string;
  notes?: string;
  master?: { user?: { firstName?: string; lastName?: string } };
};

export default function ClientReportsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<MasterForReport | null>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reports = useReportsMyQuery();
  const leads = useLeadsMyListQuery();
  const [createReport, createState] = useReportsCreateMutation();

  const reportsList = (() => {
    const raw = reports.data as unknown;
    if (Array.isArray(raw)) return raw;
    if (isRecord(raw) && Array.isArray(raw.data)) return raw.data;
    return [];
  })();
  const leadsList = (() => {
    const raw = (leads as { data?: unknown }).data;
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return (raw as { data: Record<string, unknown>[] }).data;
    }
    return [];
  })();

  const handleOpenDialog = (master: MasterForReport) => {
    setSelectedMaster(master);
    setOpenDialog(true);
    setReason('');
    setDescription('');
  };

  const handleCreateReport = async () => {
    if (!selectedMaster || !reason || !description) {
      toast.error(t('reports.fillAllFields'));
      return;
    }
    try {
      const lead = leadsList.find((l) => l.masterId === selectedMaster.id);
      await createReport({
        masterId: selectedMaster.id,
        leadId: lead?.id as string | undefined,
        reason,
        description,
      }).unwrap();
      toast.success(t('reports.created'));
      setOpenDialog(false);
      setSelectedMaster(null);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
        ? (err.data as { message: string }).message
        : err instanceof Error ? err.message : t('reports.createFailed');
      toast.error(message);
    }
  };

  const mastersFromLeads: MasterForReport[] = leadsList
    .map((lead) => lead.master as MasterForReport | undefined)
    .filter(
      (master, index, self) =>
        master && typeof master.id === 'string' &&
        self.findIndex((m) => m && m.id === master.id) === index
    ) as MasterForReport[];

  if (reports.isLoading || leads.isLoading) return <CardsSkeleton count={5} />;
  if (reports.isError) return <ErrorState error={reports.error} onRetry={reports.refetch} />;

  return (
    <div className={clientPageClassName}>
      <PageHeader
        title={t('clientDashboard.reports')}
        subtitle={t('clientDashboard.reportsSubtitle')}
      />

      {/* Section to select a master to report */}
      <div className="mb-10">
        <h3 className={cn('mb-4 flex items-center gap-2', clientSectionTitleCls)}>
          <AlertTriangle className="size-5 text-[#E97525]" />
          {t('reports.selectMasterToReport', 'Подать новую жалобу на мастера')}
        </h3>
        {mastersFromLeads.length === 0 ? (
          <div className={cn(clientCardStaticCls, 'border-dashed p-8 text-center')}>
            <p className={clientTextBody}>{t('reports.noLeadsForReports', 'У вас пока нет мастеров, на которых можно подать жалобу')}</p>
            <p className={cn('mt-1', clientTextMuted)}>{t('reports.noLeadsForReportsDesc', '(Жалобу можно подать только на мастера, с которым вы контактировали)')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mastersFromLeads.map((master) => (
              <button
                key={master.id}
                type="button"
                className={cn(clientCardCls, 'flex h-auto w-full flex-col items-start gap-3 p-5 text-left')}
                onClick={() => handleOpenDialog(master)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={cn('text-base font-semibold', clientTextTitle)}>
                    {[master.user?.firstName, master.user?.lastName].filter(Boolean).join(' ') || t('reports.unknownMaster')}
                  </span>
                  <AlertTriangle className="size-4 text-[#6C757D]" />
                </div>
                {master.category && (
                  <span className={clientTextMuted}>{getTranslatedCategoryName(t, master.category)}</span>
                )}
                <span className={cn('mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#E97525]/80')}>
                  {t('reports.clickToReport', 'Нажмите, чтобы подать жалобу')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between border-b pb-2">
        <h3 className={clientSectionTitleCls}>{t('reports.myReports', 'История моих жалоб')}</h3>
      </div>

      {reportsList.length === 0 ? (
        <ClientEmptyState
          icon={AlertTriangle}
          title={t('reports.noReports')}
          description={t('reports.noReportsDescription')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {(reportsList as ReportItem[]).map((report) => (
            <div key={report.id} className={clientCardCls}>
              <div className="p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={clientIconWrapCls}>
                          <AlertTriangle className="size-4" />
                        </span>
                        <div>
                          <h4 className={cn('text-sm font-semibold sm:text-base', clientTextTitle)}>
                            {report.master?.user?.firstName} {report.master?.user?.lastName}
                          </h4>
                          <p className={clientTextMuted}>
                            {formatDateTimeString(report.createdAt ?? null, locale)}
                          </p>
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: getStatusColor(report.status ?? 'PENDING') }}
                      >
                        {t(`reports.status.${report.status ?? 'PENDING'}`)}
                      </span>
                    </div>

                    <div className={clientInsetPanelCls}>
                      <p className={cn('mb-2', clientTextBody)}>
                        <strong className={clientTextTitle}>{t('reports.reason')}:</strong> {report.reason}
                      </p>
                      <p className={cn('whitespace-pre-wrap italic', clientTextMuted)}>
                        &quot;{report.description}&quot;
                      </p>
                    </div>

                    {report.notes && (
                      <div className="mt-4 border-t border-[#e8e8e8] pt-4 dark:border-[#2d2d2d]">
                        <p className={clientTextBody}>
                          <strong className={clientTextTitle}>{t('reports.adminNotes')}:</strong> {report.notes}
                        </p>
                      </div>
                    )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Creation Modal */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent className="overflow-hidden rounded-[18px] border-[#e8e8e8] p-0 shadow-2xl dark:border-[#2d2d2d] sm:max-w-md">
          <div className="border-b border-[#e8e8e8] bg-[#FFF8EB]/50 p-6 pb-4 dark:border-[#2d2d2d] dark:bg-[#E97525]/8">
            <DialogHeader className="space-y-3">
              <div className={cn(clientIconWrapCls, 'mx-auto size-12 rounded-full')}>
                <AlertTriangle className="size-6" />
              </div>
              <DialogTitle className={cn('text-center text-xl font-bold', clientTextTitle)}>
                {t('reports.createReport', 'Подать жалобу')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <DialogBody className="px-6 pb-6 pt-2">
            {selectedMaster && (
              <div className={cn(clientInsetPanelCls, 'mb-6 text-center')}>
                <p className={cn('mb-1 text-[11px] font-medium uppercase tracking-wider', clientTextMuted)}>
                  {t('reports.reportingMaster', 'Вы подаете жалобу на мастера')}
                </p>
                <p className={cn('text-base font-semibold', clientTextTitle)}>
                  {selectedMaster.user?.firstName} {selectedMaster.user?.lastName}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="report-reason" className="text-sm font-semibold">
                  {t('reports.reason')}
                </Label>
                <Input
                  id="report-reason"
                  className="rounded-[12px] border-[#E9ECEF] bg-white px-4 py-2 focus-visible:ring-[#E97525] dark:border-white/12 dark:bg-white/[0.04]"
                  placeholder={t('reports.reasonPlaceholder', 'Напр. Не пришел на встречу')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-description" className="text-sm font-semibold">
                  {t('reports.description')}
                </Label>
                <Textarea
                  id="report-description"
                  className="min-h-[120px] resize-none rounded-[12px] border-[#E9ECEF] bg-white px-4 py-3 focus-visible:ring-[#E97525] dark:border-white/12 dark:bg-white/[0.04]"
                  placeholder={t('reports.descriptionPlaceholder', 'Опишите ситуацию подробнее...')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="border-t border-[#e8e8e8] bg-[hsl(var(--secondary)/0.35)] p-6 dark:border-[#2d2d2d] sm:justify-between">
            <Button
              variant="ghost"
              className="w-full rounded-[12px] sm:w-auto"
              onClick={() => setOpenDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={createState.isLoading || !reason || !description}
              className={cn(clientPrimaryBtnCls, 'w-full sm:w-auto')}
            >
              {createState.isLoading ? t('common.loading') : t('reports.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
