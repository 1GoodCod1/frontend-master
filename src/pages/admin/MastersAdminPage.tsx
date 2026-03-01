import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { useIsDark } from '@/hooks/useIsDark';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminMasters } from '@/hooks/admin/masters/useAdminMasters';
import StatisticsCards from '@/components/admin/masters/StatisticsCards';
import MastersFilters from '@/components/admin/masters/MastersFilters';
import MastersEmptyState from '@/components/admin/masters/MastersEmptyState';
import MasterDetailsDialog from '@/components/admin/masters/MasterDetailsDialog';
import MasterCell from '@/components/admin/masters/MasterCell';
import CategoryCell from '@/components/admin/masters/CategoryCell';
import CityCell from '@/components/admin/masters/CityCell';
import TariffCell from '@/components/admin/masters/TariffCell';
import RatingCell from '@/components/admin/masters/RatingCell';
import ViewsCell from '@/components/admin/masters/ViewsCell';
import StatusCell from '@/components/admin/masters/StatusCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';

export default function MastersAdminPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const {
    page,
    setPage,
    limit,
    setLimit,
    verified,
    setVerified,
    featured,
    setFeatured,
    qText,
    setQText,
    selectedMaster,
    setSelectedMaster,
    isLoading,
    isError,
    error,
    refetch,
    mastersData,
    allMasters,
    statistics,
    updateLoading,
    exportToCSV,
    doUpdate,
    clearFilters,
  } = useAdminMasters();

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: t('admin.masters.master'),
      flex: 1,
      minWidth: 280,
      renderCell: (params: any) => <MasterCell master={params.row} />,
    },
    {
      field: 'category',
      headerName: t('admin.masters.category'),
      width: 180,
      renderCell: (params: any) => (
        <CategoryCell category={params.row?.category} categoryName={params.row?.categoryName} />
      ),
    },
    {
      field: 'city',
      headerName: t('admin.masters.city'),
      width: 160,
      renderCell: (params: any) => (
        <CityCell city={params.row?.city} cityName={params.row?.cityName} />
      ),
    },
    {
      field: 'tariff',
      headerName: t('admin.masters.tariff'),
      width: 120,
      renderCell: (params: any) => <TariffCell master={params.row} />,
    },
    {
      field: 'rating',
      headerName: t('admin.masters.rating'),
      width: 130,
      cellClassName: 'rating-cell',
      renderCell: (params: any) => (
        <RatingCell 
          rating={params.row?.avgRating || params.row?.rating} 
          reviewCount={params.row?.reviewCount} 
        />
      ),
    },
    {
      field: 'views',
      headerName: t('admin.masters.views'),
      width: 110,
      cellClassName: 'views-cell',
      renderCell: (params: any) => <ViewsCell views={params.row?.views} />,
    },
    {
      field: 'isVerified',
      headerName: t('admin.masters.status'),
      width: 140,
      cellClassName: 'status-cell',
      renderCell: (params: any) => (
        <StatusCell isVerified={params.value ?? params.row?.user?.isVerified} />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.masters.created'),
      width: 180,
      renderCell: (params: any) => <CreatedAtCell createdAt={params.row?.createdAt} />,
      sortable: false,
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const hasFilters = Boolean(verified || featured || qText);

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.masters.title')} subtitle={t('admin.masters.subtitle')} />

        <StatisticsCards
          totalMasters={statistics.totalMasters}
          verifiedMasters={statistics.verifiedMasters}
          featuredMasters={statistics.featuredMasters}
          avgRating={statistics.avgRating}
        />

        <SectionCard
          title={t('admin.masters.filtersSearch')}
          actions={
            <MastersFilters
              qText={qText}
              verified={verified}
              featured={featured}
              allMastersLength={allMasters.length}
              onQTextChange={setQText}
              onVerifiedChange={setVerified}
              onFeaturedChange={setFeatured}
              onExport={exportToCSV}
            />
          }
        >
          <PaginatedDataGrid
            data={mastersData}
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
              onRowDoubleClick: (p: any) => setSelectedMaster(p.row),
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
                    bgcolor: isDark ? 'rgba(123, 44, 191, 0.08)' : 'rgba(106, 76, 147, 0.08)',
                  },
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(123, 44, 191, 0.12)' : 'rgba(106, 76, 147, 0.12)',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(123, 44, 191, 0.15)' : 'rgba(106, 76, 147, 0.15)',
                    },
                  },
                  '&.even-row': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  borderBottom: '2px solid',
                  borderColor: isDark ? 'rgba(123, 44, 191, 0.3)' : 'rgba(106, 76, 147, 0.3)',
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
                '& .rating-cell, & .views-cell, & .status-cell': {
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-virtualScroller': {
                  marginTop: '56px !important',
                },
              },
            }}
          />

          {!isLoading && allMasters.length === 0 && (
            <MastersEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
          )}
        </SectionCard>

        <MasterDetailsDialog
          open={Boolean(selectedMaster)}
          master={selectedMaster}
          isLoading={updateLoading}
          onClose={() => setSelectedMaster(null)}
          onUpdate={doUpdate}
        />
    </div>
  );
}
