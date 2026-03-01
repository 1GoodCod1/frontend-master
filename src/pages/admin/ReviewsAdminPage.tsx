import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { useIsDark } from '@/hooks/useIsDark';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminReviews } from '@/hooks/admin/reviews/useAdminReviews';
import StatisticsCards from '@/components/admin/reviews/StatisticsCards';
import ReviewsFilters from '@/components/admin/reviews/ReviewsFilters';
import BulkActions from '@/components/admin/reviews/BulkActions';
import ReviewDetailsDialog from '@/components/admin/reviews/ReviewDetailsDialog';
import ReviewsEmptyState from '@/components/admin/reviews/ReviewsEmptyState';
import ClientCell from '@/components/admin/reviews/ClientCell';
import MasterCell from '@/components/admin/reviews/MasterCell';
import RatingCell from '@/components/admin/reviews/RatingCell';
import CommentCell from '@/components/admin/reviews/CommentCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';
import { StatusChip } from '@/components/ui/StatusChip';

export default function ReviewsAdminPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const {
    page,
    setPage,
    limit,
    setLimit,
    statusFilter,
    setStatusFilter,
    selection,
    setSelection,
    bulkStatus,
    setBulkStatus,
    selectedReview,
    setSelectedReview,
    confirmOpen,
    confirmTitle,
    confirmDesc,
    confirmLoading,
    isLoading,
    isError,
    error,
    refetch,
    reviewsData,
    allReviews,
    statistics,
    isRecent,
    updateStatusLoading,
    moderateLoading,
    openConfirm,
    handleConfirm,
    handleCloseConfirm,
    applyBulkStatus,
    applyBulkModerate,
    handleToggleVisibility,
    exportToCSV,
  } = useAdminReviews();

  const columns: GridColDef[] = [
    {
      field: 'clientName',
      headerName: t('admin.reviews.client'),
      width: 200,
      renderCell: (params: any) => <ClientCell review={params.row} />,
    },
    {
      field: 'master',
      headerName: t('admin.reviews.master'),
      width: 200,
      renderCell: (params: any) => <MasterCell master={params.row?.master} />,
    },
    {
      field: 'rating',
      headerName: t('admin.reviews.rating'),
      width: 140,
      cellClassName: 'rating-cell',
      renderCell: (params: any) => <RatingCell rating={params.row?.rating || 0} />,
    },
    {
      field: 'status',
      headerName: t('admin.reviews.status'),
      width: 140,
      cellClassName: 'status-cell',
      renderCell: (params: any) => <StatusChip kind="review" value={String(params.value ?? '')} />,
    },
    {
      field: 'comment',
      headerName: t('admin.reviews.comment'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => <CommentCell comment={params.row?.comment} />,
    },
    {
      field: 'createdAt',
      headerName: t('admin.reviews.created'),
      width: 180,
      renderCell: (params: any) => <CreatedAtCell createdAt={params?.row?.createdAt} />,
      sortable: false,
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.reviews.title')} subtitle={t('admin.reviews.subtitle')} />

        <StatisticsCards
          totalReviews={statistics.totalReviews}
          pendingReviews={statistics.pendingReviews}
          visibleReviews={statistics.visibleReviews}
          hiddenReviews={statistics.hiddenReviews}
          reportedReviews={statistics.reportedReviews}
        />

        <SectionCard
          title={t('admin.reviews.filtersActions')}
          actions={
            <ReviewsFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              allReviewsLength={allReviews.length}
              onExport={exportToCSV}
            />
          }
        >
          <BulkActions
            selection={selection}
            bulkStatus={bulkStatus}
            updateStatusLoading={updateStatusLoading}
            moderateLoading={moderateLoading}
            onBulkStatusChange={setBulkStatus}
            onApplyBulkStatus={() =>
              openConfirm(
                t('admin.reviews.applyBulkStatusConfirm', { count: selection.length || 0 }),
                t('admin.reviews.applyBulkStatusDesc', { status: bulkStatus }),
                async () => {
                  await applyBulkStatus();
                },
              )
            }
            onApplyBulkModerate={() =>
              openConfirm(
                t('admin.reviews.moderateBulkConfirm', { count: selection.length || 0 }),
                t('admin.reviews.moderateBulkDesc'),
                async () => {
                  await applyBulkModerate();
                },
              )
            }
            onClearSelection={() => setSelection([])}
          />

          <PaginatedDataGrid
            data={reviewsData}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onPageChange={(p, l) => {
              setPage(p);
              setLimit(l);
            }}
            columns={columns}
            dataGridProps={{
              onRowDoubleClick: (p: any) => setSelectedReview(p.row),
              rowHeight: 80,
              disableRowSelectionOnClick: false,
              getRowClassName: (params: any) => {
                const isRecentRow = isRecent(params.row?.id);
                const isEven = params.indexRelativeToCurrentPage % 2 === 0;
                return isRecentRow ? 'mm-recent-row' : isEven ? 'even-row' : '';
              },
              sx: {
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'default',
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    cursor: 'default',
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-row': {
                  cursor: 'default',
                  minHeight: '80px !important',
                  maxHeight: '80px !important',
                  '&:hover': {
                    cursor: 'pointer',
                    bgcolor: isDark ? 'rgba(74, 144, 226, 0.08)' : 'rgba(74, 144, 226, 0.08)',
                  },
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(74, 144, 226, 0.12)' : 'rgba(74, 144, 226, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(74, 144, 226, 0.15)',
                    },
                  },
                  '&.even-row': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)',
                  },
                  '&.mm-recent-row': {
                    bgcolor: isDark ? 'rgba(243, 156, 18, 0.15)' : 'rgba(243, 156, 18, 0.1)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(243, 156, 18, 0.2)' : 'rgba(243, 156, 18, 0.15)',
                    },
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  borderBottom: '2px solid',
                  borderColor: isDark ? 'rgba(74, 144, 226, 0.3)' : 'rgba(74, 144, 226, 0.3)',
                  minHeight: '56px !important',
                  maxHeight: '56px !important',
                },
                '& .MuiDataGrid-columnHeader': {
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-within': {
                    outline: 'none',
                  },
                },
                '& .rating-cell, & .status-cell': {
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-virtualScroller': {
                  marginTop: '56px !important',
                },
              },
              checkboxSelection: true,
              rowSelectionModel: selection,
              onRowSelectionModelChange: (m: any) => setSelection(m as string[]),
            }}
          />

          {!isLoading && allReviews.length === 0 && (
            <ReviewsEmptyState statusFilter={statusFilter} onClearFilter={() => setStatusFilter('')} />
          )}

          <ConfirmDialog
            open={confirmOpen}
            title={confirmTitle}
            description={confirmDesc}
            confirmText={t('admin.reviews.confirm')}
            isLoading={confirmLoading}
            onClose={handleCloseConfirm}
            onConfirm={handleConfirm}
          />
        </SectionCard>

        <ReviewDetailsDialog
          open={Boolean(selectedReview)}
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onToggleVisibility={() => selectedReview && handleToggleVisibility(selectedReview)}
        />
    </div>
  );
}
