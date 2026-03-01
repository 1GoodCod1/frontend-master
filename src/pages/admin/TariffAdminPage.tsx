import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminTariffs } from '@/hooks/admin/tariffs/useAdminTariffs';
import UpsertDialog from '@/components/admin/tariffs/UpsertDialog';
import BulkActions from '@/components/admin/tariffs/BulkActions';
import TypeCell from '@/components/admin/tariffs/TypeCell';
import FeaturesCell from '@/components/admin/tariffs/FeaturesCell';
import ActiveCell from '@/components/admin/tariffs/ActiveCell';
import ActionsCell from '@/components/admin/tariffs/ActionsCell';
import type { Tariff, UpdateTariffDto } from '@/features/tariffs/tariffsApi';

type Row = Tariff & Record<string, unknown>;

export default function TariffAdminPage() {
  const { t } = useTranslation();
  const {
    q,
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
    setConfirmOpen,
    bulkIds,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    handleConfirm,
    handleInvalidateCache,
    invalidateCacheLoading,
  } = useAdminTariffs();

  const columns = React.useMemo<GridColDef<Row>[]>(() => {
    const base: GridColDef<Row>[] = [
      { field: 'name', headerName: t('admin.tariffs.name'), minWidth: 160, flex: 1 },
      {
        field: 'type',
        headerName: t('admin.tariffs.type'),
        minWidth: 120,
        renderCell: (p) => <TypeCell type={p.row?.type} />,
      },
      { field: 'price', headerName: t('admin.tariffs.price'), minWidth: 140 },
      { field: 'amount', headerName: t('admin.tariffs.amount'), minWidth: 100, type: 'number' },
      { field: 'days', headerName: t('admin.tariffs.days'), minWidth: 80, type: 'number' },
      {
        field: 'features',
        headerName: t('admin.tariffs.features'),
        minWidth: 300,
        flex: 1,
        renderCell: (p) => <FeaturesCell features={p.row?.features} />,
      },
      {
        field: 'isActive',
        headerName: t('admin.tariffs.active'),
        minWidth: 100,
        renderCell: (p) => {
          const id = p.row?.id;
          if (!id) return <span />;
          return <ActiveCell isActive={p.row?.isActive} />;
        },
      },
      { field: 'sortOrder', headerName: t('admin.tariffs.sortOrder'), minWidth: 100, type: 'number' },
      {
        field: 'actions',
        headerName: t('admin.tariffs.actions'),
        minWidth: 180,
        sortable: false,
        filterable: false,
        renderCell: (p) => {
          const id = p.row?.id;
          if (!id) return <span />;
          return (
            <ActionsCell
              id={String(id)}
              name={String(p.row?.name ?? id)}
              onEdit={(row) => setEditRow(row as Row)}
              onDelete={handleDelete}
              row={p.row}
            />
          );
        },
      },
    ];
    return base;
  }, [handleDelete, setEditRow, t]);

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader
        title={t('admin.tariffs.title')}
        subtitle={t('admin.tariffs.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvalidateCache}
              disabled={invalidateCacheLoading}
            >
              <RefreshCw className={invalidateCacheLoading ? 'size-4 animate-spin' : 'size-4'} />
              {t('admin.tariffs.invalidateCache')}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <RouterLink to="/plans" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <ExternalLink className="size-4" />
                {t('admin.tariffs.viewPublicPage')}
              </RouterLink>
            </Button>
          </div>
        }
      />
      <SectionCard title={t('admin.tariffs.title')} subtitle={t('admin.tariffs.subtitle')}>
        <Card className="border">
          <CardContent className="p-4">
            <BulkActions
              bulkIdsLength={bulkIds.length}
              onCreate={() => setCreateOpen(true)}
              onBulkDelete={handleBulkDelete}
            />

            <PaginatedDataGrid
              data={q.data}
              loading={q.isFetching}
              error={q.error}
              page={1}
              limit={100}
              columns={columns as GridColDef[]}
              onPageChange={() => { }}
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

        <UpsertDialog
          open={createOpen}
          mode="create"
          initial={{
            name: '',
            type: 'BASIC',
            price: '',
            amount: 0,
            days: 30,
            description: '',
            features: [],
            isActive: true,
            sortOrder: 0,
          }}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />

        <UpsertDialog
          open={Boolean(editRow)}
          mode="edit"
          initial={{
            name: editRow?.name ?? '',
            type: (editRow?.type as 'BASIC' | 'VIP' | 'PREMIUM') ?? 'BASIC',
            price: editRow?.price ?? '',
            amount: Number(editRow?.amount) || 0,
            days: editRow?.days ?? 30,
            description: editRow?.description ?? '',
            features: Array.isArray(editRow?.features)
              ? editRow.features
              : (typeof editRow?.features === 'string' ? JSON.parse(editRow.features) : []),
            isActive: Boolean(editRow?.isActive),
            sortOrder: Number(editRow?.sortOrder ?? 0),
          }}
          onClose={() => setEditRow(null)}
          onSubmit={async (values) => {
            if (!editRow?.id) return;
            const body: UpdateTariffDto = { ...values };
            await handleUpdate(String(editRow.id), body);
          }}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          description={confirmDesc}
          confirmColor={confirmColor}
          confirmText={confirmColor === 'error' ? t('common.delete') : t('common.confirm')}
          isLoading={confirmLoading}
          onClose={() => {
            if (confirmLoading) return;
            setConfirmOpen(false);
          }}
          onConfirm={handleConfirm}
        />
      </SectionCard>
    </div>
  );
}
