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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

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
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p className="text-sm italic">{t('reports.noLeadsForReports', 'У вас пока нет мастеров, на которых можно подать жалобу')}</p>
              <p className="text-xs">{t('reports.noLeadsForReportsDesc', '(Жалобу можно подать только на мастера, с которым вы контактировали)')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mastersFromLeads.map((master) => (
              <Button
                key={master.id}
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-5 text-left transition-all hover:border-destructive/50 hover:bg-destructive/5 dark:hover:bg-destructive/10"
                onClick={() => handleOpenDialog(master)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-base font-bold">
                    {[master.user?.firstName, master.user?.lastName].filter(Boolean).join(' ') || t('reports.unknownMaster')}
                  </span>
                </div>
                {master.category && (
                  <span className="text-xs text-muted-foreground">
                    {getTranslatedCategoryName(t, master.category)}
                  </span>
                )}
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-destructive/80">
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
        <Card className="border-border dark:border-white/[0.08] p-10 text-center">
          <p className="mb-2 text-lg font-semibold text-muted-foreground">{t('reports.noReports')}</p>
          <p className="text-sm text-muted-foreground">{t('reports.noReportsDescription')}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {(reportsList as ReportItem[]).map((report) => (
            <Card key={report.id} className="border-border dark:border-white/[0.08] bg-card/50">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">
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

                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-2 text-sm">
                      <strong className="text-foreground">{t('reports.reason')}:</strong> {report.reason}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground italic">
                      &quot;{report.description}&quot;
                    </p>
                  </div>

                  {report.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{t('reports.adminNotes')}:</strong> {report.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Creation Modal */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
              <AlertTriangle className="size-5" />
              {t('reports.createReport')}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            {selectedMaster && (
              <div className="mb-5 rounded-xl bg-amber-50/50 p-4 border border-amber-100/50 dark:bg-amber-900/10 dark:border-amber-900/20">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70 mb-1">
                  {t('reports.reportingMaster', 'Вы подаете жалобу на мастера')}:
                </p>
                <p className="text-base font-bold text-amber-900 dark:text-amber-100">
                  {selectedMaster.user?.firstName} {selectedMaster.user?.lastName}
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="report-reason" className="text-sm font-semibold ml-0.5">
                  {t('reports.reason')}
                </Label>
                <Input
                  id="report-reason"
                  className="bg-muted/30 focus-visible:ring-amber-500"
                  placeholder={t('reports.reasonPlaceholder', 'Напр. Не пришел на встречу')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description" className="text-sm font-semibold ml-0.5">
                  {t('reports.description')}
                </Label>
                <Textarea
                  id="report-description"
                  className="bg-muted/30 focus-visible:ring-amber-500 min-h-[120px] resize-none"
                  placeholder={t('reports.descriptionPlaceholder', 'Опишите ситуацию подробнее...')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="ghost"
              className="hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
              onClick={() => setOpenDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={createState.isLoading || !reason || !description}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700 transition-all duration-300"
            >
              {createState.isLoading ? t('common.loading') : t('reports.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
