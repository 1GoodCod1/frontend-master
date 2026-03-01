import { useEffect, useState } from 'react';
import { useAdminUsersQuery } from '@/features/admin/adminApi';
import { useUsersToggleVerifyMutation, useUsersToggleBanMutation } from '@/features/users/usersApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';

type AdminUserRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  isVerified?: boolean | null;
  isBanned?: boolean | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
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

export function useAdminUsers() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [role, setRole] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [banned, setBanned] = useState<boolean | null>(null);
  const [qText, setQText] = useState<string>('');
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursorForPage = pageCursors[page];
  const cursor = typeof cursorForPage === 'string' && cursorForPage ? cursorForPage : undefined;

  useEffect(() => {
    setPage(1);
    setPageCursors({ 1: undefined });
  }, [limit, role, verified, banned, qText]);

  const q = useAdminUsersQuery(
    {
      page,
      limit,
      ...(cursor ? { cursor } : {}),
      ...(role ? { role } : {}),
      ...(verified !== null ? { verified } : {}),
      ...(banned !== null ? { banned } : {}),
      ...(qText ? { q: qText } : {}),
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [verify] = useUsersToggleVerifyMutation();
  const [ban] = useUsersToggleBanMutation();

  // Преобразуем данные для PaginatedDataGrid
  const responseData = unwrapEnvelope(q.data);
  const users =
    isRecord(responseData) && Array.isArray(responseData.users)
      ? responseData.users.filter(isRecord)
      : [];
  const pagination =
    isRecord(responseData) && isRecord(responseData.pagination) ? responseData.pagination : null;

  useEffect(() => {
    const next =
      pagination && typeof pagination.nextCursor === 'string' ? pagination.nextCursor : undefined;
    if (!next) return;
    setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next }));
  }, [page, pagination]);

  const usersData:
    | { items: AdminUserRow[]; meta: PaginationMeta }
    | unknown = users.length
    ? {
        items: users as AdminUserRow[],
        meta:
          (pagination as PaginationMeta) ??
          ({ total: users.length, page, limit } as PaginationMeta),
      }
    : responseData;

  // Calculate statistics
  const allUsers = isRecord(usersData) && Array.isArray(usersData.items)
    ? (usersData.items.filter(isRecord) as AdminUserRow[])
    : [];
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.isVerified && !u.isBanned).length;
  const pendingUsers = allUsers.filter((u) => !u.isVerified && !u.isBanned).length;
  const blockedUsers = allUsers.filter((u) => u.isBanned).length;

  const handleVerify = async (userId: string, isVerified: boolean) => {
    try {
      await verify({ id: userId }).unwrap();
      toast.success(isVerified ? 'User unverified successfully' : 'User verified successfully');
      await q.refetch();
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? 'Action failed');
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    try {
      await ban({ id: userId }).unwrap();
      toast.success(isBanned ? 'User unbanned successfully' : 'User banned successfully');
      await q.refetch();
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? 'Action failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Role', 'Status', 'Created At', 'Last Login'];
    const rows = allUsers.map((user) => [
      user.id,
      user.email ?? '',
      user.role ?? '',
      user.isVerified && !user.isBanned ? 'Active' : user.isBanned ? 'Blocked' : 'Pending',
      user.createdAt ? formatDateTimeString(user.createdAt) : '',
      user.lastLoginAt ? formatDateTimeString(user.lastLoginAt) : 'Never',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell)}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Users exported to CSV');
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    role,
    setRole,
    verified,
    setVerified,
    banned,
    setBanned,
    qText,
    setQText,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    usersData,
    allUsers,
    statistics: {
      totalUsers,
      activeUsers,
      pendingUsers,
      blockedUsers,
    },
    handleVerify,
    handleBan,
    exportToCSV,
  };
}
