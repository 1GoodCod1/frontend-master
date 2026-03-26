import { useState, useMemo } from 'react';
import { useAuditLogsQuery, useAuditStatsQuery, useAuditStreamQuery } from '@/features/audit/auditApi';
import { formatDateTimeString } from '@/utils/date';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import type { AuditLogRow } from '.';

export function useAdminAudit() {
  const [tab, setTab] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [streamLimit, setStreamLimit] = useState(50);

  const stats = useAuditStatsQuery({ timeframe });
  const logs = useAuditLogsQuery({ page, limit });
  const stream = useAuditStreamQuery({ limit: streamLimit }, { pollingInterval: 5000 });

  const { items: allLogs, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AuditLogRow>(logs.data, {
        page,
        limit,
        total: 0,
      }),
    [logs.data, page, limit],
  );

  /** Total rows server-side (all pages), not current page length. */
  const totalLogs = meta.total;

  const logsData = useMemo(
    () => ({
      items: allLogs,
      meta,
    }),
    [allLogs, meta],
  );

  const streamData = useMemo(() => {
    const { items } = parseAdminPaginatedResponse<AuditLogRow>(stream.data, {
      page: 1,
      limit: streamLimit,
      total: 0,
    });
    return items.slice(0, streamLimit);
  }, [stream.data, streamLimit]);

  const doExportToCSV = () => {
    const headers = ['ID', 'Action', 'Entity', 'Entity ID', 'Actor ID', 'IP', 'User Agent', 'Created At'];
    const rows = allLogs.map((log) => [
      log.id ?? '',
      log.action ?? '',
      log.entity ?? '',
      log.entityId || '-',
      log.actorId || '-',
      log.ip || '-',
      log.ua || '-',
      log.createdAt ? formatDateTimeString(String(log.createdAt)) : '',
    ]);
    exportToCSV(headers, rows, 'audit_logs_export', 'Audit logs exported to CSV');
  };

  return {
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
    exportToCSV: doExportToCSV,
  };
}
