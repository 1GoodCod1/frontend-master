import { useState, useRef, useMemo } from 'react';
import type { GridRowSelectionModel } from '@/types/dataGrid';
import toast from 'react-hot-toast';
import {
  useCitiesListQuery,
  useCitiesToggleMutation,
  useCitiesDeleteMutation,
  useCitiesCreateMutation,
  useCitiesUpdateMutation,
} from '@/features/cities/citiesApi';
import type { CreateCityDto, UpdateCityDto } from '@/types';
import type { AdminCityRow } from '.';

export function useAdminCities() {
  const q = useCitiesListQuery();
  const [toggle] = useCitiesToggleMutation();
  const [del] = useCitiesDeleteMutation();
  const [create] = useCitiesCreateMutation();
  const [update] = useCitiesUpdateMutation();

  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminCityRow | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState<string | undefined>(undefined);
  const [confirmColor, setConfirmColor] = useState<'primary' | 'error'>('primary');
  const confirmActionRef = useRef<null | (() => Promise<void>)>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const bulkIds = useMemo(() => selection.map((x) => String(x)), [selection]);

  const openConfirm = (opts: {
    title: string;
    description?: string;
    color?: 'primary' | 'error';
    action: () => Promise<void>;
  }) => {
    setConfirmTitle(opts.title);
    setConfirmDesc(opts.description);
    setConfirmColor(opts.color ?? 'primary');
    confirmActionRef.current = opts.action;
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
  };

  const handleConfirm = async () => {
    const act = confirmActionRef.current;
    if (!act) return;
    setConfirmLoading(true);
    try {
      await act();
      setConfirmOpen(false);
    } catch {
      // errors toasted in action
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggle({ id }).unwrap();
      toast.success('Updated');
      q.refetch();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = (row: AdminCityRow) => {
    openConfirm({
      title: `Delete city "${String(row?.name ?? row.id)}"?`,
      description: 'This action cannot be undone.',
      color: 'error',
      action: async () => {
        await del({ id: String(row.id) }).unwrap();
        toast.success('Deleted');
        q.refetch();
      },
    });
  };

  const handleCreate = async (values: CreateCityDto) => {
    await create(values).unwrap();
    toast.success('Created');
    q.refetch();
  };

  const handleUpdate = async (values: CreateCityDto) => {
    if (!editRow?.id) return;
    const body: UpdateCityDto = { ...values };
    await update({ id: String(editRow.id), body }).unwrap();
    toast.success('Saved');
    q.refetch();
    setEditRow(null);
  };

  const bulkToggle = async () => {
    if (!bulkIds.length) return;
    const t = toast.loading(`Toggling ${bulkIds.length}...`);
    try {
      for (const id of bulkIds) await toggle({ id }).unwrap();
      toast.success('Bulk toggled', { id: t });
      setSelection([]);
      q.refetch();
    } catch {
      toast.error('Bulk toggle failed', { id: t });
    }
  };

  const bulkDelete = () => {
    if (!bulkIds.length) return;
    openConfirm({
      title: `Delete ${bulkIds.length} cities?`,
      description: 'This action cannot be undone.',
      color: 'error',
      action: async () => {
        const t = toast.loading(`Deleting ${bulkIds.length}...`);
        try {
          for (const id of bulkIds) await del({ id }).unwrap();
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

  return {
    data: q.data,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    isFetching: q.isFetching,
    refetch: q.refetch,
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
    openConfirm,
    handleCloseConfirm,
    handleConfirm,
    handleToggle,
    handleDelete,
    handleCreate,
    handleUpdate,
    bulkToggle,
    bulkDelete,
  };
}
