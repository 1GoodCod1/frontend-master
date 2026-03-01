import type { GridColDef } from '@/types/dataGrid';
import { ShieldCheck } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminVerificationRequests } from '@/hooks/admin/verification/useAdminVerificationRequests';
import ReviewDialog from '@/components/admin/verification/ReviewDialog';
import MasterCell from '@/components/admin/verification/MasterCell';
import EmailCell from '@/components/admin/verification/EmailCell';
import PhoneCell from '@/components/admin/verification/PhoneCell';
import DocumentTypeCell from '@/components/admin/verification/DocumentTypeCell';
import DocumentNumberCell from '@/components/admin/verification/DocumentNumberCell';
import CreatedAtCell from '@/components/admin/common/CreatedAtCell';
import ActionsCell from '@/components/admin/verification/ActionsCell';
import { useGetVerificationStatsQuery } from '@/features/verification/verificationApi';
import { useTranslation } from 'react-i18next';
import type { VerificationDetail, VerificationStats } from '@/features/verification/verificationApi';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function VerificationRequestsPage() {
  const { t } = useTranslation();
  const { data: statsData } = useGetVerificationStatsQuery();
  const stats: VerificationStats | null = (() => {
    const raw = statsData as unknown;
    if (isRecord(raw) && isRecord(raw.data)) return raw.data as unknown as VerificationStats;
    if (isRecord(raw)) return raw as unknown as VerificationStats;
    return null;
  })();
  const approvedCount = stats?.approvedCount ?? 0;

  const {
    page,
    setPage,
    limit,
    setLimit,
    reviewDialogOpen,
    decision,
    notes,
    isLoading,
    isError,
    error,
    refetch,
    verifications,
    meta,
    detail,
    isLoadingDetail,
    detailError,
    isReviewing,
    handleReview,
    handleOpenDetails,
    handleCloseDialog,
    setDecision,
    setNotes,
    refetchDetail,
  } = useAdminVerificationRequests();

  const columns: GridColDef[] = [
    {
      field: 'master',
      headerName: t('admin.masters.master'),
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <MasterCell master={row.master} />;
      },
    },
    {
      field: 'email',
      headerName: t('admin.users.email'),
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <EmailCell email={row.master?.user?.email} />;
      },
    },
    {
      field: 'phone',
      headerName: t('verification.phone'),
      minWidth: 150,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <PhoneCell phone={row.phone} />;
      },
    },
    {
      field: 'documentType',
      headerName: t('verification.documentType'),
      minWidth: 150,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <DocumentTypeCell documentType={row.documentType} />;
      },
    },
    {
      field: 'documentNumber',
      headerName: t('verification.documentNumber'),
      minWidth: 150,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <DocumentNumberCell documentNumber={row.documentNumber} />;
      },
    },
    {
      field: 'submittedAt',
      headerName: t('verification.submittedAt'),
      minWidth: 180,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <CreatedAtCell createdAt={row.submittedAt} />;
      },
    },
    {
      field: 'actions',
      headerName: t('admin.users.actions'),
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as unknown as VerificationDetail;
        return <ActionsCell id={row.id} onReview={handleOpenDetails} />;
      },
    },
  ];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader
        title={t('verification.requestsTitle')}
        subtitle={t('verification.requestsSubtitle')}
      />

      <div className="mb-6 flex items-center gap-4 rounded-xl border-2 border-border p-4">
        <ShieldCheck className="size-8 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-semibold text-foreground">
            {t('verification.first100Banner', { count: approvedCount })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('verification.first100BannerHint')}
          </p>
        </div>
      </div>

      <Card className="border">
        <CardContent className="p-6">
          <PaginatedDataGrid
            data={{ items: verifications, meta }}
            loading={isLoading}
            page={page}
            limit={limit}
            columns={columns}
            onPageChange={(newPage: number, newLimit: number) => {
              setPage(newPage);
              setLimit(newLimit);
            }}
          />
        </CardContent>
      </Card>

      <ReviewDialog
        open={reviewDialogOpen}
        detail={detail}
        isLoadingDetail={isLoadingDetail}
        detailError={detailError}
        onRefetchDetail={refetchDetail}
        decision={decision}
        notes={notes}
        isReviewing={isReviewing}
        onDecisionChange={setDecision}
        onNotesChange={setNotes}
        onClose={handleCloseDialog}
        onReview={handleReview}
      />
    </div>
  );
}
