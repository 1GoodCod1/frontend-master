import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GridColDef } from '@/types/dataGrid';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAdminUsers } from '@/hooks/admin/users/useAdminUsers';
import StatisticsCards from '@/components/admin/users/StatisticsCards';
import UsersFilters from '@/components/admin/users/UsersFilters';
import UserDetailsDialog from '@/components/admin/users/UserDetailsDialog';
import ConfirmationDialog from '@/components/admin/users/ConfirmationDialog';
import UserCell from '@/components/admin/users/UserCell';
import RoleCell from '@/components/admin/users/RoleCell';
import StatusCell from '@/components/admin/users/StatusCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';
import ActionsCell from '@/components/admin/users/ActionsCell';

export default function UsersPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'verify' | 'ban' | null;
    user: any;
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

  const handleOpenConfirmDialog = (action: 'verify' | 'ban', user: any) => {
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

    if (action === 'verify') {
      await handleVerify(user.id, user.isVerified);
    } else if (action === 'ban') {
      await handleBan(user.id, user.isBanned);
    }
    handleCloseConfirmDialog();
  };

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: t('admin.users.user'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: any) => <UserCell user={params.row} />,
    },
    {
      field: 'role',
      headerName: t('admin.users.role'),
      width: 140,
      cellClassName: 'role-cell',
      renderCell: (params: any) => <RoleCell role={params.value} />,
    },
    {
      field: 'isVerified',
      headerName: t('admin.users.status'),
      width: 160,
      cellClassName: 'status-cell',
      renderCell: (params: any) => (
        <StatusCell isVerified={Boolean(params.value)} isBanned={Boolean(params.row.isBanned)} />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('admin.users.created'),
      width: 180,
      renderCell: (params: any) => <CreatedAtCell createdAt={params?.row?.createdAt} />,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: t('admin.users.actions'),
      width: 140,
      sortable: false,
      renderCell: (params: any) => (
        <ActionsCell
          user={params.row}
          onVerify={(user) => handleOpenConfirmDialog('verify', user)}
          onBan={(user) => handleOpenConfirmDialog('ban', user)}
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
              onRowDoubleClick: (row) => setSelected(row),
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
            handleOpenConfirmDialog('verify', selected);
            setSelected(null);
          }}
          onBan={() => {
            handleOpenConfirmDialog('ban', selected);
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
