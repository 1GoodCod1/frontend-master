import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { useIsDark } from '@/hooks/useIsDark';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminLeads, type AdminLeadRow } from '@/hooks/admin/leads/useAdminLeads';
import StatisticsCards from '@/components/admin/leads/StatisticsCards';
import LeadsFilters from '@/components/admin/leads/LeadsFilters';
import BulkActions from '@/components/admin/leads/BulkActions';
import LeadDetailsDialog from '@/components/admin/leads/LeadDetailsDialog';
import LeadsEmptyState from '@/components/admin/leads/LeadsEmptyState';
import ClientCell from '@/components/admin/leads/ClientCell';
import MasterCell from '@/components/admin/leads/MasterCell';
import StatusCell from '@/components/admin/leads/StatusCell';
import MessageCell from '@/components/admin/leads/MessageCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';

export default function LeadsAdminPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selection,
    setSelection,
    bulkStatus,
    setBulkStatus,
    selectedLead,
    setSelectedLead,
    confirmOpen,
    setConfirmOpen,
    isLoading,
    isError,
    error,
    refetch,
    leadsData,
    allLeads,
    statistics,
    isRecent,
    updateStatusLoading,
    exportToCSV,
    applyBulkStatus,
    clearFilters,
  } = useAdminLeads();

  const columns: GridColDef[] = [
    {
      field: 'clientName',
      headerName: t('admin.leads.client'),
      flex: 1,
      minWidth: 220,
      renderCell: (params) => <ClientCell lead={params.row as AdminLeadRow} />,
    },
    {
      field: 'master',
      headerName: t('admin.leads.master'),
      width: 200,
      renderCell: (params) => <MasterCell master={params.row?.master as { id?: string; slug?: string; user?: { firstName?: string; lastName?: string } } | null} />,
    },
    {
      field: 'status',
      headerName: t('admin.leads.status'),
      width: 140,
      cellClassName: 'status-cell',
      renderCell: (params) => (
        <StatusCell status={params.value as string} isPremium={Boolean(params.row?.isPremium)} />
      ),
    },
    {
      field: 'message',
      headerName: t('admin.leads.message'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <MessageCell message={(params.row?.message ?? params.row?.description) as string} />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.leads.created'),
      width: 180,
      renderCell: (params) => <CreatedAtCell createdAt={params.row?.createdAt as string} />,
      sortable: false,
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const hasFilters = Boolean(status || dateFrom || dateTo);

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.leads.title')} subtitle={t('admin.leads.subtitle')} />

        <StatisticsCards
          totalLeads={statistics.totalLeads}
          newLeads={statistics.newLeads}
          inProgressLeads={statistics.inProgressLeads}
          closedLeads={statistics.closedLeads}
          premiumLeads={statistics.premiumLeads}
        />

        <SectionCard
          title={t('admin.leads.filtersSearch')}
          actions={
            <LeadsFilters
              status={status}
              dateFrom={dateFrom}
              dateTo={dateTo}
              allLeadsLength={allLeads.length}
              onStatusChange={setStatus}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onExport={exportToCSV}
            />
          }
        >
          <BulkActions
            selection={selection}
            bulkStatus={bulkStatus}
            isLoading={updateStatusLoading}
            onBulkStatusChange={setBulkStatus}
            onApply={() => setConfirmOpen(true)}
            onClearSelection={() => setSelection([])}
          />

          <PaginatedDataGrid
            data={leadsData}
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
              onRowClick: (row) => setSelectedLead(row as AdminLeadRow),
              onRowDoubleClick: (row) => setSelectedLead(row as AdminLeadRow),
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
                    bgcolor: isDark ? 'rgba(46, 204, 113, 0.15)' : 'rgba(46, 204, 113, 0.1)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.15)',
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
                '& .status-cell': {
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

          {!isLoading && allLeads.length === 0 && (
            <LeadsEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
          )}

          <ConfirmDialog
            open={confirmOpen}
            title={t('admin.leads.applyStatusConfirm', { count: selection.length || 0 })}
            description={t('admin.leads.applyStatusDesc', { status: bulkStatus })}
            confirmText={t('admin.leads.apply')}
            onClose={() => setConfirmOpen(false)}
            onConfirm={async () => {
              setConfirmOpen(false);
              await applyBulkStatus();
            }}
          />
        </SectionCard>

        <LeadDetailsDialog
          open={Boolean(selectedLead)}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusUpdated={refetch}
        />
    </div>
  );
}
