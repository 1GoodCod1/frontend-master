import { useEffect, useMemo, useState } from 'react';
import { useAdminMastersQuery, useAdminUpdateMasterMutation } from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse, toNumber } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import type { AdminMasterRow } from '.';

export function useAdminMasters() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [qText, setQText] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<AdminMasterRow | null>(null);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursor =
    typeof pageCursors[page] === 'string' && pageCursors[page] ? pageCursors[page] : undefined;

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      setPageCursors({ 1: undefined });
    });
  }, [limit, verified, featured, qText]);

  const q = useAdminMastersQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    ...(verified ? { verified } : {}),
    ...(featured ? { featured } : {}),
    ...(qText ? { q: qText } : {}),
  });
  const [update, updState] = useAdminUpdateMasterMutation();

  const { items: allMasters, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminMasterRow>(q.data, {
        page,
        limit,
        total: 0,
      }),
    [q.data, page, limit],
  );

  const totalMasters = allMasters.length;
  const verifiedMasters = allMasters.filter((m) => m.user?.isVerified || m.isVerified).length;
  const featuredMasters = allMasters.filter((m) => m.isFeatured).length;
  const avgRating =
    allMasters.length > 0
      ? (
          allMasters.reduce((sum, m) => sum + toNumber(m.avgRating ?? m.rating), 0) /
          allMasters.length
        ).toFixed(1)
      : '0.0';

  const mastersData = useMemo(
    () => ({
      items: allMasters,
      meta,
    }),
    [allMasters, meta],
  );

  useEffect(() => {
    const next = meta?.nextCursor && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    queueMicrotask(() =>
      setPageCursors((prev) =>
        prev[page + 1] === next ? prev : { ...prev, [page + 1]: next },
      ),
    );
  }, [page, meta]);

  const doExportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'City', 'Tariff', 'Rating', 'Views', 'Verified', 'Created At'];
    const rows = allMasters.map((master) => [
      master.id,
      `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || master.fullName || '-',
      master.user?.email || master.email || '-',
      master.phone || '-',
      master.category?.name || '-',
      master.city?.name || '-',
      String(master.tariffType || master.tariff || master.plan || 'BASIC').toUpperCase(),
      master.avgRating || master.rating || '0',
      master.views || '0',
      master.user?.isVerified || master.isVerified ? 'Yes' : 'No',
      master.createdAt ? formatDateTimeString(master.createdAt) : '',
    ]);
    exportToCSV(headers, rows, 'masters_export', 'Masters exported to CSV');
  };

  const doUpdate = async () => {
    if (!selectedMaster?.id) return;
    try {
      await update({ id: selectedMaster.id }).unwrap();
      toast.success('Master updated successfully');
      q.refetch();
      setSelectedMaster(null);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Update failed');
    }
  };

  const clearFilters = () => {
    setVerified(false);
    setFeatured(false);
    setQText('');
  };

  return {
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
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    mastersData,
    allMasters,
    statistics: {
      totalMasters,
      verifiedMasters,
      featuredMasters,
      avgRating,
    },
    updateLoading: updState.isLoading,
    exportToCSV: doExportToCSV,
    doUpdate,
    clearFilters,
  };
}
