import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { useIsDark } from '@/hooks/useIsDark';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminPayments } from '@/hooks/admin/payments/useAdminPayments';
import StatisticsCards from '@/components/admin/payments/StatisticsCards';
import PaymentsFilters from '@/components/admin/payments/PaymentsFilters';
import PaymentsEmptyState from '@/components/admin/payments/PaymentsEmptyState';
import PaymentDetailsDialog from '@/components/admin/payments/PaymentDetailsDialog';
import MasterCell from '@/components/admin/payments/MasterCell';
import TariffCell from '@/components/admin/payments/TariffCell';
import AmountCell from '@/components/admin/payments/AmountCell';
import StatusCell from '@/components/admin/payments/StatusCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';

export default function PaymentsAdminPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    selectedPayment,
    setSelectedPayment,
    isLoading,
    isError,
    error,
    refetch,
    paymentsData,
    allPayments,
    statistics,
    exportToCSV,
    clearFilters,
  } = useAdminPayments();

  const columns: GridColDef[] = [
    {
      field: 'master',
      headerName: t('admin.payments.master'),
      flex: 1,
      minWidth: 220,
      renderCell: (params: any) => <MasterCell master={params.row?.master} />,
    },
    {
      field: 'tariffType',
      headerName: t('admin.payments.tariff'),
      width: 120,
      renderCell: (params: any) => <TariffCell payment={params.row} />,
    },
    {
      field: 'amount',
      headerName: t('admin.payments.amount'),
      width: 140,
      cellClassName: 'amount-cell',
      renderCell: (params: any) => (
        <AmountCell amount={params.row?.amount} currency={params.row?.currency} />
      ),
    },
    {
      field: 'status',
      headerName: t('admin.payments.status'),
      width: 140,
      cellClassName: 'status-cell',
      renderCell: (params: any) => <StatusCell status={params.value} />,
    },
    {
      field: 'createdAt',
      headerName: t('admin.payments.created'),
      width: 180,
      renderCell: (params: any) => <CreatedAtCell createdAt={params.row?.createdAt} />,
      sortable: false,
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const hasFilters = Boolean(status);

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.payments.title')} subtitle={t('admin.payments.subtitle')} />

        <StatisticsCards
          totalPayments={statistics.totalPayments}
          paidPayments={statistics.paidPayments}
          pendingPayments={statistics.pendingPayments}
          failedPayments={statistics.failedPayments}
          totalRevenue={statistics.totalRevenue}
        />

        <SectionCard
          title={t('admin.payments.filtersSearch')}
          actions={
            <PaymentsFilters
              status={status}
              allPaymentsLength={allPayments.length}
              onStatusChange={setStatus}
              onExport={exportToCSV}
            />
          }
        >
          <PaginatedDataGrid
            data={paymentsData}
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
              onRowDoubleClick: (p: any) => setSelectedPayment(p.row),
              rowHeight: 80,
              disableRowSelectionOnClick: true,
              getRowClassName: (params: any) => params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row',
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
                    bgcolor: isDark ? 'rgba(39, 174, 96, 0.08)' : 'rgba(39, 174, 96, 0.08)',
                  },
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(39, 174, 96, 0.12)' : 'rgba(39, 174, 96, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(39, 174, 96, 0.15)' : 'rgba(39, 174, 96, 0.15)',
                    },
                  },
                  '&.even-row': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  borderBottom: '2px solid',
                  borderColor: isDark ? 'rgba(39, 174, 96, 0.3)' : 'rgba(39, 174, 96, 0.3)',
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
                '& .amount-cell, & .status-cell': {
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-virtualScroller': {
                  marginTop: '56px !important',
                },
              },
            }}
          />

          {!isLoading && allPayments.length === 0 && (
            <PaymentsEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
          )}
        </SectionCard>

        <PaymentDetailsDialog
          open={Boolean(selectedPayment)}
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
    </div>
  );
}
