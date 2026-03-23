import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useAdminReports } from '@/hooks/admin/reports';
import StatisticsCards from '@/features/admin/components/reports/StatisticsCards';
import ReportsFilters from '@/features/admin/components/reports/ReportsFilters';
import ReportCard, { type ReportLike } from '@/features/admin/components/reports/ReportCard';
import ReportsEmptyState from '@/features/admin/components/reports/ReportsEmptyState';
import ReportReviewDialog from '@/features/admin/components/reports/ReportReviewDialog';

export default function ReportsAdminPage() {
  const { t } = useTranslation();

  const {
    statusFilter,
    setStatusFilter,
    selectedReport,
    openDialog,
    action,
    setAction,
    notes,
    setNotes,
    reportsList,
    totalMatching,
    isLoading,
    isError,
    error,
    refetch,
    statistics,
    updateStatusLoading,
    exportToCSV,
    handleOpenDialog,
    handleCloseDialog,
    handleUpdateStatus,
  } = useAdminReports();

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.reports.title')} subtitle={t('admin.reports.subtitle')} />

      <StatisticsCards
        totalReports={statistics.totalReports}
        pendingReports={statistics.pendingReports}
        reviewedReports={statistics.reviewedReports}
        resolvedReports={statistics.resolvedReports}
        rejectedReports={statistics.rejectedReports}
      />

      <div className="mb-6 rounded-xl border border-border p-6">
        <ReportsFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalMatching={totalMatching}
          onExport={exportToCSV}
        />
      </div>

      {reportsList.length === 0 ? (
        <ReportsEmptyState statusFilter={statusFilter} />
      ) : (
        <div className="flex flex-col gap-4">
          {reportsList.map((report, idx) => (
            <ReportCard key={String(report.id ?? idx)} report={report as ReportLike} onOpenDialog={handleOpenDialog} />
          ))}
        </div>
      )}

      <ReportReviewDialog
        open={openDialog}
        selectedReport={selectedReport}
        action={action}
        notes={notes}
        isLoading={updateStatusLoading}
        onClose={handleCloseDialog}
        onActionChange={setAction}
        onNotesChange={setNotes}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
