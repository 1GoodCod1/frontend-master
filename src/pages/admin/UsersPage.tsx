import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GridColDef, GridRenderCellParams } from '@/types/dataGrid';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminUsers } from '@/hooks/admin/users';
import StatisticsCards from '@/features/admin/components/users/StatisticsCards';
import UsersFilters from '@/features/admin/components/users/UsersFilters';
import UserDetailsDialog from '@/features/admin/components/users/UserDetailsDialog';
import ConfirmationDialog from '@/features/admin/components/users/ConfirmationDialog';
import UserCell from '@/features/admin/components/users/UserCell';
import RoleCell from '@/features/admin/components/users/RoleCell';
import StatusCell from '@/features/admin/components/users/StatusCell';
import CreatedAtCell from '@/features/admin/components/common/CreatedAtCell';
import ActionsCell from '@/features/admin/components/users/ActionsCell';

export default function UsersPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'verify' | 'ban' | null;
    user: Record<string, unknown> | null;
  }>({
    open: false,
    action: null,
    user: null,
  });

  const {
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
    isLoading,
    isError,
    error,
    refetch,
    usersData,
    allUsers,
    statistics,
    handleVerify,
    handleBan,
    exportToCSV,
  } = useAdminUsers();

  const handleOpenConfirmDialog = (action: 'verify' | 'ban', user: Record<string, unknown>) => {
    setConfirmDialog({
      open: true,
      action,
      user,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      action: null,
      user: null,
    });
  };

  const handleConfirmAction = async () => {
    const { action, user } = confirmDialog;
    if (!action || !user) return;

    const u = user as { id: string; isVerified?: boolean; isBanned?: boolean };
    if (action === 'verify') {
      await handleVerify(u.id, Boolean(u.isVerified));
    } else if (action === 'ban') {
      await handleBan(u.id, Boolean(u.isBanned));
    }
    handleCloseConfirmDialog();
  };

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: t('admin.users.user'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => <UserCell user={params.row} />,
    },
    {
      field: 'role',
      headerName: t('admin.users.role'),
      width: 140,
      cellClassName: 'role-cell',
      renderCell: (params: GridRenderCellParams) => <RoleCell role={params.value as string} />,
    },
    {
      field: 'isVerified',
      headerName: t('admin.users.status'),
      width: 160,
      cellClassName: 'status-cell',
      renderCell: (params: GridRenderCellParams) => (
        <StatusCell isVerified={Boolean(params.value)} isBanned={Boolean(params.row.isBanned)} />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.users.created'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => <CreatedAtCell createdAt={params?.row?.createdAt as string | null | undefined} />,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: t('admin.users.actions'),
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <ActionsCell
          user={params.row as { id: string; isVerified?: boolean; isBanned?: boolean }}
          onVerify={(u) => handleOpenConfirmDialog('verify', u)}
          onBan={(u) => handleOpenConfirmDialog('ban', u)}
        />
      ),
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.users.title')} subtitle={t('admin.users.subtitle')} />

        <StatisticsCards
          totalUsers={statistics.totalUsers}
          activeUsers={statistics.activeUsers}
          pendingUsers={statistics.pendingUsers}
          blockedUsers={statistics.blockedUsers}
        />

        <SectionCard
          title={t('admin.users.filters')}
          actions={
            <UsersFilters
              qText={qText}
              role={role}
              verified={verified}
              banned={banned}
              allUsersLength={allUsers.length}
              onQTextChange={setQText}
              onRoleChange={setRole}
              onVerifiedChange={setVerified}
              onBannedChange={setBanned}
              onExport={exportToCSV}
            />
          }
        >
          <PaginatedDataGrid
            data={usersData}
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
              onRowDoubleClick: (row: Record<string, unknown>) => setSelected(row),
              rowHeight: 80,
              getRowClassName: (_row, index) => (index % 2 === 0 ? 'even-row bg-muted/20' : 'odd-row'),
            }}
          />
        </SectionCard>

        <UserDetailsDialog
          open={Boolean(selected)}
          user={selected}
          onClose={() => setSelected(null)}
          onVerify={() => {
            if (selected) handleOpenConfirmDialog('verify', selected);
            setSelected(null);
          }}
          onBan={() => {
            if (selected) handleOpenConfirmDialog('ban', selected);
            setSelected(null);
          }}
        />

        <ConfirmationDialog
          open={confirmDialog.open}
          action={confirmDialog.action}
          user={confirmDialog.user}
          onClose={handleCloseConfirmDialog}
          onConfirm={handleConfirmAction}
        />
    </div>
  );
}
