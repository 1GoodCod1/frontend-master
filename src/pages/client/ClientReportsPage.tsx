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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('clientDashboard.reports')}
        subtitle={t('clientDashboard.reportsSubtitle')}
      />

      {/* Section to select a master to report */}
      <div className="mb-10">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <AlertTriangle className="size-5 text-amber-600" />
          {t('reports.selectMasterToReport', 'Подать новую жалобу на мастера')}
        </h3>
        {mastersFromLeads.length === 0 ? (
          <Card className="border-dashed border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p className="text-sm italic text-foreground/70">{t('reports.noLeadsForReports', 'У вас пока нет мастеров, на которых можно подать жалобу')}</p>
              <p className="mt-1 text-xs">{t('reports.noLeadsForReportsDesc', '(Жалобу можно подать только на мастера, с которым вы контактировали)')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mastersFromLeads.map((master) => (
              <Button
                key={master.id}
                variant="outline"
                className="group relative h-auto flex-col items-start gap-3 overflow-hidden rounded-xl border border-black/10 bg-card p-5 text-left text-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-amber-50 hover:text-foreground hover:shadow-md dark:border-white/10 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-foreground"
                onClick={() => handleOpenDialog(master)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100" />
                <div className="relative z-10 flex w-full items-center justify-between gap-2">
                  <span className="text-base font-bold text-foreground transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500">
                    {[master.user?.firstName, master.user?.lastName].filter(Boolean).join(' ') || t('reports.unknownMaster')}
                  </span>
                  <AlertTriangle className="size-4 text-muted-foreground transition-colors group-hover:text-amber-500" />
                </div>
                {master.category && (
                  <span className="relative z-10 text-xs text-muted-foreground transition-colors group-hover:text-muted-foreground">
                    {getTranslatedCategoryName(t, master.category)}
                  </span>
                )}
                <div className="relative z-10 mt-1 flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600/80 opacity-80 transition-opacity group-hover:opacity-100 dark:text-amber-500/80">
                  {t('reports.clickToReport', 'Нажмите, чтобы подать жалобу')}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-bold">{t('reports.myReports', 'История моих жалоб')}</h3>
      </div>

      {reportsList.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-black/10 p-12 text-center dark:border-white/10 dark:bg-card/5">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100/50 text-amber-500 dark:bg-amber-500/10">
            <AlertTriangle className="size-6" />
          </div>
          <p className="mb-2 text-lg font-semibold text-foreground">{t('reports.noReports')}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t('reports.noReportsDescription')}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {(reportsList as ReportItem[]).map((report) => (
            <Card key={report.id} className="overflow-hidden rounded-xl border border-black/5 bg-card/50 shadow-sm transition hover:bg-card/80 hover:shadow-md dark:border-white/5 dark:bg-card/20 dark:hover:bg-card/40">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          <AlertTriangle className="size-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold sm:text-base">
                            {report.master?.user?.firstName} {report.master?.user?.lastName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTimeString(report.createdAt ?? null, locale)}
                          </p>
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: getStatusColor(report.status ?? 'PENDING') }}
                      >
                        {t(`reports.status.${report.status ?? 'PENDING'}`)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-black/5 p-4 dark:bg-white/5">
                      <p className="mb-2 text-sm">
                        <strong className="text-foreground">{t('reports.reason')}:</strong> {report.reason}
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground italic">
                        &quot;{report.description}&quot;
                      </p>
                    </div>

                    {report.notes && (
                      <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/5">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">{t('reports.adminNotes')}:</strong> {report.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Creation Modal */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent className="overflow-hidden rounded-2xl border-black/10 p-0 shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:max-w-md">
          <div className="relative bg-gradient-to-b from-amber-50 to-transparent p-6 pb-4 dark:from-amber-950/20">
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <AlertTriangle className="size-6" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                {t('reports.createReport', 'Подать жалобу')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <DialogBody className="px-6 pb-6 pt-2">
            {selectedMaster && (
              <div className="mb-6 flex flex-col items-center rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center dark:border-amber-500/10 dark:bg-amber-500/5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-600/70 dark:text-amber-400/80">
                  {t('reports.reportingMaster', 'Вы подаете жалобу на мастера')}
                </p>
                <p className="text-base font-bold text-foreground">
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
                  className="rounded-xl border-black/10 bg-black/5 px-4 py-2 transition-colors hover:bg-black/10 focus-visible:ring-amber-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-amber-500"
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
                  className="min-h-[120px] resize-none rounded-xl border-black/10 bg-black/5 px-4 py-3 transition-colors hover:bg-black/10 focus-visible:ring-amber-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-amber-500"
                  placeholder={t('reports.descriptionPlaceholder', 'Опишите ситуацию подробнее...')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="border-t border-black/5 bg-black/[0.02] p-6 dark:border-white/5 dark:bg-white/[0.02] sm:justify-between">
            <Button
              variant="ghost"
              className="w-full rounded-xl hover:bg-black/5 sm:w-auto dark:hover:bg-white/5"
              onClick={() => setOpenDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={createState.isLoading || !reason || !description}
              className="w-full rounded-xl bg-amber-600 text-white transition-colors hover:bg-amber-700 sm:w-auto dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {createState.isLoading ? t('common.loading') : t('reports.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
