import { useState, useMemo } from 'react';
import type { GridRowSelectionModel } from '@/types/dataGrid';
import {
  useGetTariffsQuery,
  useDeleteTariffMutation,
  useCreateTariffMutation,
  useUpdateTariffMutation,
  type CreateTariffDto,
  type UpdateTariffDto,
} from '@/features/tariffs/tariffsApi';
import { useAdminInvalidateTariffsCacheMutation } from '@/features/admin/adminApi';
import toast from 'react-hot-toast';
import { toErrorMessage } from '@/utils/errors';
import { useAdminConfirm } from '../useAdminConfirm';
import type { AdminTariffRow } from '.';

export function useAdminTariffs() {
  const q = useGetTariffsQuery();
  const [invalidateCache, invalidateState] = useAdminInvalidateTariffsCacheMutation();
  const [del] = useDeleteTariffMutation();
  const [create] = useCreateTariffMutation();
  const [update] = useUpdateTariffMutation();

  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminTariffRow | null>(null);

  const confirm = useAdminConfirm();
  const bulkIds = useMemo(() => selection.map((x) => String(x)), [selection]);

  const handleCreate = async (values: CreateTariffDto) => {
    await create(values).unwrap();
    toast.success('Created');
    q.refetch();
  };

  const handleUpdate = async (id: string, values: UpdateTariffDto) => {
    await update({ id, data: values }).unwrap();
    toast.success('Saved');
    q.refetch();
    setEditRow(null);
  };

  const handleDelete = async (id: string, name?: string) => {
    confirm.openConfirm({
      title: `Delete tariff "${name ?? id}"?`,
      description: 'This action cannot be undone.',
      color: 'error',
      action: async () => {
        await del(id).unwrap();
        toast.success('Deleted');
        q.refetch();
      },
    });
  };

  const handleBulkDelete = () => {
    if (!bulkIds.length) return;
    confirm.openConfirm({
      title: `Delete ${bulkIds.length} tariffs?`,
      description: 'This action cannot be undone.',
      color: 'error',
      action: async () => {
        const t = toast.loading(`Deleting ${bulkIds.length}...`);
        try {
          for (const id of bulkIds) await del(id).unwrap();
          toast.success('Bulk deleted', { id: t });
          setSelection([]);
          q.refetch();
        } catch {
          toast.error('Bulk delete failed', { id: t });
          throw new Error('bulk delete failed');
        }
      },
    });
  };

  const handleInvalidateCache = async () => {
    try {
      const res = await invalidateCache().unwrap();
      toast.success(`Cache invalidated (${res.invalidated} keys). List will refresh.`);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Failed to invalidate cache');
    }
  };

  return {
    q,
    selection, setSelection,
    createOpen, setCreateOpen,
    editRow, setEditRow,
    ...confirm,
    bulkIds,
    handleCreate, handleUpdate,
    handleDelete, handleBulkDelete,
    handleInvalidateCache,
    invalidateCacheLoading: invalidateState.isLoading,
  };
}
