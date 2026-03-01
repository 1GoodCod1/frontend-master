import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useAdminReports } from '@/hooks/admin/reports/useAdminReports';
import StatisticsCards from '@/components/admin/reports/StatisticsCards';
import ReportsFilters from '@/components/admin/reports/ReportsFilters';
import ReportCard from '@/components/admin/reports/ReportCard';
import ReportsEmptyState from '@/components/admin/reports/ReportsEmptyState';
import ReportReviewDialog from '@/components/admin/reports/ReportReviewDialog';

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
  if (isError) return <ErrorState error={error as any} onRetry={refetch} />;

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
          reportsListLength={reportsList.length}
          onExport={exportToCSV}
        />
      </div>

      {reportsList.length === 0 ? (
        <ReportsEmptyState statusFilter={statusFilter} />
      ) : (
        <div className="flex flex-col gap-4">
          {reportsList.map((report: any) => (
            <ReportCard key={report.id} report={report} onOpenDialog={handleOpenDialog} />
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
