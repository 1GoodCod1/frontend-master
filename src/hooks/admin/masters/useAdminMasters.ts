import { useEffect, useMemo, useState } from 'react';
import { useAdminMastersQuery, useAdminUpdateMasterMutation } from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';

type AdminMasterRow = {
  id: string;
  createdAt?: string | null;
  phone?: string | null;
  fullName?: string | null;
  email?: string | null;
  isFeatured?: boolean | null;
  isVerified?: boolean | null;
  avgRating?: number | null;
  rating?: number | null;
  views?: number | null;
  tariffType?: string | null;
  tariff?: string | null;
  plan?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    isVerified?: boolean | null;
  } | null;
  category?: { name?: string | null } | null;
  city?: { name?: string | null } | null;
} & Record<string, unknown>;

type PaginationMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  nextCursor?: string | null;
} & Record<string, unknown>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  return isRecord(raw) && 'data' in raw ? (raw as { data: unknown }).data : raw;
}

function toErrorMessage(e: unknown): string | undefined {
  if (!isRecord(e)) return undefined;
  const data = isRecord(e.data) ? e.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof e.message === 'string' ? e.message : undefined)
  );
}

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function useAdminMasters() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [qText, setQText] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<AdminMasterRow | null>(null);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursorForPage = pageCursors[page];
  const cursor = typeof cursorForPage === 'string' && cursorForPage ? cursorForPage : undefined;

  useEffect(() => {
    setPage(1);
    setPageCursors({ 1: undefined });
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

  const responseData = unwrapEnvelope(q.data);
  const allMasters: AdminMasterRow[] =
    isRecord(responseData) && Array.isArray(responseData.items)
      ? (responseData.items.filter(isRecord) as AdminMasterRow[])
      : isRecord(responseData) && Array.isArray(responseData.masters)
        ? (responseData.masters.filter(isRecord) as AdminMasterRow[])
        : Array.isArray(responseData)
          ? (responseData.filter(isRecord) as AdminMasterRow[])
          : [];
  
  const totalMasters = allMasters.length;
  const verifiedMasters = allMasters.filter((m) => m.user?.isVerified || m.isVerified).length;
  const featuredMasters = allMasters.filter((m) => m.isFeatured).length;
  const avgRating = allMasters.length > 0
    ? (allMasters.reduce((sum, m) => sum + toNumber(m.avgRating ?? m.rating), 0) / allMasters.length).toFixed(1)
    : '0.0';

  const mastersData = useMemo(
    () => ({
      items: allMasters,
      meta: (isRecord(responseData) && (responseData.pagination || responseData.meta) ? ((responseData.pagination ?? responseData.meta) as PaginationMeta) : undefined) || { 
        total: allMasters.length, 
        page, 
        limit 
      },
    }),
    [allMasters, responseData, page, limit],
  );

  useEffect(() => {
    const meta = isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined;
    const next = isRecord(meta) && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next }));
  }, [page, responseData]);

  const exportToCSV = () => {
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
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `masters_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Masters exported to CSV');
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
    exportToCSV,
    doUpdate,
    clearFilters,
  };
}
