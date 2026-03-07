import { useTranslation } from 'react-i18next';
import { Shield, History, Radio, Download } from 'lucide-react';
import type { GridColDef, GridRenderCellParams } from '@/types/dataGrid';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PaginatedDataGrid } from '@/components/common/PaginatedDataGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAdminAudit, type AuditLogRow } from '@/hooks/admin/audit/useAdminAudit';
import StatisticsCards from '@/features/admin/components/audit/StatisticsCards';
import AuditLogDetailsDialog from '@/features/admin/components/audit/AuditLogDetailsDialog';
import AuditEmptyState from '@/features/admin/components/audit/AuditEmptyState';
import StatsTab from '@/features/admin/components/audit/StatsTab';
import StreamTab from '@/features/admin/components/audit/StreamTab';
import ActionCell from '@/features/admin/components/audit/ActionCell';
import EntityCell from '@/features/admin/components/audit/EntityCell';
import ActorCell from '@/features/admin/components/audit/ActorCell';
import IpCell from '@/features/admin/components/audit/IpCell';
import CreatedAtCell from '@/features/admin/components/common/CreatedAtCell';

export default function AuditPage() {
  const { t } = useTranslation();

  const {
    tab,
    setTab,
    selectedLog,
    setSelectedLog,
    timeframe,
    setTimeframe,
    page,
    setPage,
    limit,
    setLimit,
    streamLimit,
    setStreamLimit,
    stats,
    logs,
    stream,
    logsData,
    allLogs,
    totalLogs,
    streamData,
    exportToCSV,
  } = useAdminAudit();

  const logColumns: GridColDef[] = [
    {
      field: 'action',
      headerName: t('admin.audit.action'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => <ActionCell action={params.value as string} />,
    },
    {
      field: 'entity',
      headerName: t('admin.audit.entity'),
      width: 140,
      renderCell: (params: GridRenderCellParams) => <EntityCell entity={params.value as string} />,
    },
    {
      field: 'actorId',
      headerName: t('admin.audit.actor'),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => <ActorCell actorId={params.value as string} />,
    },
    {
      field: 'ip',
      headerName: t('admin.audit.ipAddress'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => <IpCell ip={params.value as string} />,
    },
    {
      field: 'createdAt',
      headerName: t('admin.audit.created'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => <CreatedAtCell createdAt={params.value as string} />,
      sortable: false,
    },
  ];

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.audit.title')} subtitle={t('admin.audit.subtitle')} />
        
        {/* Statistics Cards - только для Logs Tab */}
        {tab === 1 && (
          <StatisticsCards
            totalLogs={totalLogs}
            currentPage={page}
            perPage={limit}
          />
        )}

        <SectionCard title={t('admin.audit.sectionTitle')} subtitle={t('admin.audit.sectionSubtitle')}>
          <Tabs value={String(tab)} onValueChange={(v) => setTab(Number(v))} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
              <TabsTrigger value="0" className="gap-2">
                <Shield className="size-4" />
                <span className="hidden sm:inline">📊</span> {t('admin.audit.stats')}
              </TabsTrigger>
              <TabsTrigger value="1" className="gap-2">
                <History className="size-4" />
                <span className="hidden sm:inline">📋</span> {t('admin.audit.logs')}
              </TabsTrigger>
              <TabsTrigger value="2" className="gap-2">
                <Radio className="size-4" />
                <span className="hidden sm:inline">🔴</span> {t('admin.audit.liveStream')}
              </TabsTrigger>
            </TabsList>

          {tab === 0 && (
            <StatsTab
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              stats={stats}
            />
          )}

          {tab === 1 && (
            logs.isLoading ? (
              <LoadingState />
            ) : logs.isError ? (
              <ErrorState error={logs.error} onRetry={logs.refetch} />
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToCSV}
                          disabled={!allLogs.length}
                          className="gap-2"
                        >
                          <Download className="size-4" />
                          {t('admin.audit.export')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('admin.audit.exportTooltip')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <PaginatedDataGrid
                  data={logsData}
                  loading={logs.isLoading}
                  error={logs.error}
                  page={page}
                  limit={limit}
                  onPageChange={(p, l) => {
                    setPage(p);
                    setLimit(l);
                  }}
                  columns={logColumns}
                  dataGridProps={{
                    onRowDoubleClick: (row) => setSelectedLog(row as AuditLogRow),
                    rowHeight: 70,
                    getRowClassName: (_row, index) => index % 2 === 0 ? 'even-row' : 'odd-row',
                  }}
                />
                
                {!logs.isLoading && allLogs.length === 0 && (
                  <AuditEmptyState />
                )}
              </>
            )
          )}

          {tab === 2 && (
            <StreamTab
              streamLimit={streamLimit}
              onStreamLimitChange={setStreamLimit}
              stream={stream}
              streamData={streamData}
            />
          )}
          </Tabs>
        </SectionCard>

        <AuditLogDetailsDialog
          open={Boolean(selectedLog)}
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
    </div>
  );
}
