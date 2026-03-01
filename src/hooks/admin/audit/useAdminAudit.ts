import { useState, useMemo } from 'react';
import { useAuditLogsQuery, useAuditStatsQuery, useAuditStreamQuery } from '@/features/audit/auditApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';

type AuditLogRow = {
  id?: string;
  action?: string | null;
  entity?: string | null;
  entityId?: string | null;
  actorId?: string | null;
  ip?: string | null;
  ua?: string | null;
  createdAt?: string | number | null;
} & Record<string, unknown>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  return isRecord(raw) && 'data' in raw ? (raw as { data: unknown }).data : raw;
}

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

  const responseData = unwrapEnvelope(logs.data);
  const allLogs: AuditLogRow[] =
    isRecord(responseData) && Array.isArray(responseData.items)
      ? (responseData.items.filter(isRecord) as AuditLogRow[])
      : isRecord(responseData) && Array.isArray(responseData.logs)
        ? (responseData.logs.filter(isRecord) as AuditLogRow[])
        : Array.isArray(responseData)
          ? (responseData.filter(isRecord) as AuditLogRow[])
          : [];
  const totalLogs = allLogs.length;

  const logsData = useMemo(
    () => ({
      items: allLogs,
      meta: (isRecord(responseData) && (responseData.pagination || responseData.meta) ? (responseData.pagination ?? responseData.meta) : undefined) || { 
        total: allLogs.length, 
        page, 
        limit 
      },
    }),
    [allLogs, responseData, page, limit],
  );

  const streamData = useMemo(() => {
    const raw = unwrapEnvelope(stream.data);
    const data: AuditLogRow[] =
      isRecord(raw) && Array.isArray(raw.items)
        ? (raw.items.filter(isRecord) as AuditLogRow[])
        : isRecord(raw) && Array.isArray(raw.logs)
          ? (raw.logs.filter(isRecord) as AuditLogRow[])
          : Array.isArray(raw)
            ? (raw.filter(isRecord) as AuditLogRow[])
            : [];
    return data.slice(0, streamLimit);
  }, [stream.data, streamLimit]);

  const exportToCSV = () => {
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
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Audit logs exported to CSV');
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
    exportToCSV,
  };
}
