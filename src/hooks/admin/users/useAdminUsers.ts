import { useEffect, useState, useMemo } from 'react';
import { useAdminUsersQuery, useAdminUsersStatsQuery } from '@/features/admin/adminApi';
import { useUsersToggleVerifyMutation, useUsersToggleBanMutation } from '@/features/users/usersApi';
import { formatDateTimeString } from '@/utils/date';
import { parseAdminPaginatedResponse, parseAdminUsersStatsSummary } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import toast from 'react-hot-toast';
import { useAdminCursors } from '../useAdminCursors';
import type { AdminUserRow } from '.';

export function useAdminUsers() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [role, setRole] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [banned, setBanned] = useState<boolean | null>(null);
  const [qText, setQText] = useState<string>('');

  const { cursor, resetCursors, updateMeta } = useAdminCursors(page);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      resetCursors();
    });
  }, [limit, role, verified, banned, qText, resetCursors]);

  const filterParams = {
    ...(role ? { role } : {}),
    ...(verified === true ? { verified: true as const } : {}),
    ...(banned === true ? { banned: true as const } : {}),
  };

  const q = useAdminUsersQuery(
    {
      page,
      limit,
      ...(cursor ? { cursor } : {}),
      ...filterParams,
      ...(qText ? { q: qText } : {}),
    },
    { refetchOnMountOrArgChange: true },
  );

  const statsQ = useAdminUsersStatsQuery(filterParams, {
    refetchOnMountOrArgChange: true,
  });

  const [verify] = useUsersToggleVerifyMutation();
  const [ban] = useUsersToggleBanMutation();

  const { items: allUsers, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminUserRow>(q.data, {
        page, limit, total: 0,
      }),
    [q.data, page, limit],
  );

  useEffect(() => { updateMeta(meta); }, [meta, updateMeta]);

  const usersData = useMemo(() => ({ items: allUsers, meta }), [allUsers, meta]);

  const summary = useMemo(
    () => parseAdminUsersStatsSummary(statsQ.data),
    [statsQ.data],
  );

  const statistics = {
    totalUsers: summary.total,
    activeUsers: summary.active,
    pendingUsers: summary.pending,
    blockedUsers: summary.blocked,
  };

  const handleVerify = async (userId: string, isVerified: boolean) => {
    try {
      await verify({ id: userId }).unwrap();
      toast.success(isVerified ? 'User unverified successfully' : 'User verified successfully');
      await Promise.all([q.refetch(), statsQ.refetch()]);
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? 'Action failed');
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    try {
      await ban({ id: userId }).unwrap();
      toast.success(isBanned ? 'User unbanned successfully' : 'User banned successfully');
      await Promise.all([q.refetch(), statsQ.refetch()]);
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? 'Action failed');
    }
  };

  const doExportToCSV = () => {
    const headers = ['ID', 'Email', 'Role', 'Status', 'Created At', 'Last Login'];
    const rows = allUsers.map((user) => [
      user.id,
      user.email ?? '',
      user.role ?? '',
      user.isVerified && !user.isBanned ? 'Active' : user.isBanned ? 'Blocked' : 'Pending',
      user.createdAt ? formatDateTimeString(user.createdAt) : '',
      user.lastLoginAt ? formatDateTimeString(user.lastLoginAt) : 'Never',
    ]);
    exportToCSV(headers, rows, 'users_export', 'Users exported to CSV');
  };

  return {
    page, setPage, limit, setLimit,
    role, setRole, verified, setVerified,
    banned, setBanned, qText, setQText,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    usersData, allUsers,
    statistics,
    handleVerify, handleBan,
    exportToCSV: doExportToCSV,
  };
}
