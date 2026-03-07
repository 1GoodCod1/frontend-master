import { useTranslation } from 'react-i18next';
import type { GridColDef, GridRenderCellParams } from '@/types/dataGrid';
import { useIsDark } from '@/hooks/useIsDark';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminReviews, type AdminReviewRow } from '@/hooks/admin/reviews/useAdminReviews';
import StatisticsCards from '@/features/admin/components/reviews/StatisticsCards';
import ReviewsFilters from '@/features/admin/components/reviews/ReviewsFilters';
import BulkActions from '@/features/admin/components/reviews/BulkActions';
import ReviewDetailsDialog from '@/features/admin/components/reviews/ReviewDetailsDialog';
import ReviewsEmptyState from '@/features/admin/components/reviews/ReviewsEmptyState';
import ClientCell from '@/features/admin/components/reviews/ClientCell';
import MasterCell, { type ReviewMasterLike } from '@/features/admin/components/reviews/MasterCell';
import RatingCell from '@/features/admin/components/reviews/RatingCell';
import CommentCell from '@/features/admin/components/reviews/CommentCell';
import CreatedAtCell from '@/features/admin/components/common/CreatedAtCell';
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
      renderCell: (params: GridRenderCellParams) => <ClientCell review={params.row as import('@/types/reviews').ReviewDto} />,
    },
    {
      field: 'master',
      headerName: t('admin.reviews.master'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => <MasterCell master={params.row?.master as ReviewMasterLike | null} />,
    },
    {
      field: 'rating',
      headerName: t('admin.reviews.rating'),
      width: 140,
      cellClassName: 'rating-cell',
      renderCell: (params: GridRenderCellParams) => <RatingCell rating={Number(params.row?.rating ?? 0)} />,
    },
    {
      field: 'status',
      headerName: t('admin.reviews.status'),
      width: 140,
      cellClassName: 'status-cell',
      renderCell: (params: GridRenderCellParams) => <StatusChip kind="review" value={String(params.value ?? '')} />,
    },
    {
      field: 'comment',
      headerName: t('admin.reviews.comment'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <CommentCell comment={params.row?.comment as string | null | undefined} />,
    },
    {
      field: 'createdAt',
      headerName: t('admin.reviews.created'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => <CreatedAtCell createdAt={params?.row?.createdAt as string | null | undefined} />,
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
              onRowDoubleClick: (row) => setSelectedReview(row as AdminReviewRow),
              rowHeight: 80,
              disableRowSelectionOnClick: false,
              getRowClassName: (row: Record<string, unknown>, index: number) => {
                const isRecentRow = isRecent(row?.id);
                const isEven = index % 2 === 0;
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
              onRowSelectionModelChange: (m: (string | number)[]) => setSelection(m as string[]),
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
