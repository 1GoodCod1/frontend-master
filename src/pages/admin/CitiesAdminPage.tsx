import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminCities } from '@/hooks/admin/cities';
import CityUpsertDialog from '@/features/admin/components/cities/CityUpsertDialog';
import BulkActions from '@/features/admin/components/common/BulkActions';
import ActiveCell from '@/features/admin/components/common/ActiveCell';
import ActionsCell from '@/features/admin/components/common/ActionsCell';

type Row = {
  id: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
  [k: string]: unknown;
};

export default function CitiesAdminPage() {
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    selection,
    setSelection,
    createOpen,
    setCreateOpen,
    editRow,
    setEditRow,
    confirmOpen,
    confirmTitle,
    confirmDesc,
    confirmColor,
    confirmLoading,
    bulkIds,
    handleCloseConfirm,
    handleConfirm,
    handleToggle,
    handleDelete,
    handleCreate,
    handleUpdate,
    bulkToggle,
    bulkDelete,
  } = useAdminCities();

  const columns = React.useMemo<GridColDef<Row>[]>(() => {
    const base: GridColDef<Row>[] = [
      { field: 'name', headerName: t('admin.cities.name'), minWidth: 200, flex: 1 },
      { field: 'slug', headerName: t('admin.cities.slug'), minWidth: 200, flex: 1 },
      {
        field: 'isActive',
        headerName: t('admin.cities.active'),
        minWidth: 140,
        renderCell: (p) => {
          const id = p.row?.id;
          const checked = Boolean(p.row?.isActive);
          return <ActiveCell id={String(id ?? '')} checked={checked} onToggle={handleToggle} />;
        },
      },
      {
        field: 'actions',
        headerName: t('admin.users.actions'),
        minWidth: 240,
        sortable: false,
        filterable: false,
        renderCell: (p) => {
          const id = p.row?.id;
          const name = p.row?.name;
          return (
            <ActionsCell
              id={String(id ?? '')}
              name={name}
              onEdit={() => setEditRow(p.row as Row)}
              onDelete={() => handleDelete(p.row as Row)}
            />
          );
        },
      },
    ];
    return base;
  }, [handleToggle, handleDelete, setEditRow, t]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.cities.title')} subtitle={t('admin.cities.subtitle')} />
      <SectionCard title={t('admin.cities.citiesList')} subtitle={t('admin.cities.citiesSubtitle')}>
        <Card className="border border-border dark:border-white/[0.08] overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">{t('admin.cities.list')}</p>
              <BulkActions
                bulkIdsLength={bulkIds.length}
                onCreate={() => setCreateOpen(true)}
                onToggle={bulkToggle}
                onDelete={bulkDelete}
              />
            </div>

            <PaginatedDataGrid
              data={data}
              loading={isFetching}
              error={error}
              page={1}
              limit={100}
              columns={columns as import('@/types/dataGrid').GridColDef[]}
              onPageChange={() => {}}
              height={620}
              dataGridProps={{
                checkboxSelection: true,
                disableRowSelectionOnClick: true,
                rowSelectionModel: selection,
                onRowSelectionModelChange: (m) => setSelection(m),
              }}
            />
          </CardContent>
        </Card>

        <CityUpsertDialog
          open={createOpen}
          mode="create"
          initial={{ name: '', slug: '', isActive: true }}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />

        <CityUpsertDialog
          open={Boolean(editRow)}
          mode="edit"
          initial={{
            name: editRow?.name ?? '',
            slug: editRow?.slug ?? '',
            isActive: Boolean(editRow?.isActive),
          }}
          onClose={() => setEditRow(null)}
          onSubmit={handleUpdate}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          description={confirmDesc}
          confirmColor={confirmColor}
          confirmText={confirmColor === 'error' ? t('common.delete') : t('common.confirm')}
          isLoading={confirmLoading}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirm}
        />
      </SectionCard>
    </div>
  );
}
