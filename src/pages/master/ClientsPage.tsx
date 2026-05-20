import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowUpDown, Phone,
  MessageSquare, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import { useLeadsClientsQuery, type ClientAggregated } from '@/features/leads/leadsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead,
  TableRow, TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterInputCls,
  masterLinkCls,
  masterOutlineBtnCls,
  masterPageClassName,
  masterSectionTitleCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';
import { getLocaleFromLanguage } from '@/utils/date';
import { paths } from '@/constants/routes';

type SortField = 'lastRequestAt' | 'totalRequests' | 'clientName' | 'firstRequestAt';
type SortOrder = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-[#E97525]',
  PENDING_CLOSE: 'bg-orange-400',
  CLOSED: 'bg-emerald-500',
  SPAM: 'bg-rose-500',
};

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
}) {
  if (sortBy !== field) return <ArrowUpDown className="size-3 opacity-40" />;
  return sortOrder === 'asc' ? (
    <ChevronUp className="size-3 text-[#E97525]" />
  ) : (
    <ChevronDown className="size-3 text-[#E97525]" />
  );
}

function StatusDots({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
  const segments = Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => {
      const order = ['NEW', 'IN_PROGRESS', 'PENDING_CLOSE', 'CLOSED', 'SPAM'];
      return order.indexOf(a) - order.indexOf(b);
    });

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-2 w-20 rounded-full overflow-hidden bg-muted/30">
        {segments.map(([status, count]) => (
          <div
            key={status}
            className={cn(STATUS_COLORS[status] || 'bg-muted')}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      <span className={cn('text-xs tabular-nums', masterTextMuted)}>{total}</span>
    </div>
  );
}

function StatusBreakdownDetail({
  breakdown,
  t,
}: {
  breakdown: Record<string, number>;
  t: (key: string) => string;
}) {
  const labels: Record<string, string> = {
    NEW: t('clients.statusNew'),
    IN_PROGRESS: t('clients.statusInProgress'),
    PENDING_CLOSE: t('clients.statusPendingClose'),
    CLOSED: t('clients.statusClosed'),
    SPAM: t('clients.statusSpam'),
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(breakdown)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => (
          <Badge
            key={status}
            variant="outline"
            className={cn(
              'text-[10px] gap-1 px-1.5 py-0 font-medium',
            )}
          >
            <span className={cn('inline-block size-1.5 rounded-full', STATUS_COLORS[status])} />
            {labels[status] || status}: {count}
          </Badge>
        ))}
    </div>
  );
}

export default function ClientsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('lastRequestAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useLeadsClientsQuery(
    { search: search || undefined, sortBy, sortOrder },
    { refetchOnMountOrArgChange: true },
  );

  const clients = data?.items ?? [];

  const formatDate = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return (dateStr: string) => {
      const d = new Date(dateStr);
      return Number.isNaN(d.getTime()) ? '—' : fmt.format(d);
    };
  }, [locale]);

  const formatRelative = useMemo(() => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return (dateStr: string) => {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '—';
      const diffMs = d.getTime() - Date.now();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (Math.abs(diffDays) < 1) {
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        if (Math.abs(diffHours) < 1) {
          const diffMin = Math.round(diffMs / (1000 * 60));
          return rtf.format(diffMin, 'minute');
        }
        return rtf.format(diffHours, 'hour');
      }
      if (Math.abs(diffDays) > 30) return formatDate(dateStr);
      return rtf.format(diffDays, 'day');
    };
  }, [locale, formatDate]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) return <LoadingState label={t('clients.loading')} />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className={masterPageClassName}>
      <PageHeader title={t('clients.title')} subtitle={t('clients.subtitle')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={cn(masterCardStaticCls, 'p-4 text-center')}>
          <div className="text-2xl font-black text-[#212529] dark:text-white">{data?.total ?? 0}</div>
          <div className={cn('mt-1', masterTextMuted)}>{t('clients.totalClients')}</div>
        </div>
        <div className={cn(masterCardStaticCls, 'p-4 text-center')}>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {clients.reduce((s, c) => s + c.totalRequests, 0)}
          </div>
          <div className={cn('mt-1', masterTextMuted)}>{t('clients.totalRequests')}</div>
        </div>
        <div className={cn(masterCardStaticCls, 'p-4 text-center')}>
          <div className="text-2xl font-black text-[#E97525]">
            {clients.filter((c) => (c.statusBreakdown['IN_PROGRESS'] || 0) > 0).length}
          </div>
          <div className={cn('mt-1', masterTextMuted)}>{t('clients.activeClients')}</div>
        </div>
        <div className={cn(masterCardStaticCls, 'p-4 text-center')}>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {clients.filter((c) => c.totalRequests > 1).length}
          </div>
          <div className={cn('mt-1', masterTextMuted)}>{t('clients.repeatClients')}</div>
        </div>
      </div>

      <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
        <div className="flex flex-col gap-3 border-b border-[#e8e8e8] px-4 py-4 dark:border-[#2d2d2d] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className={masterIconWrapCls}>
              <Users className="size-4" />
            </span>
            <h2 className={masterSectionTitleCls}>{t('clients.tableTitle')}</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6C757D]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('clients.searchPlaceholder')}
              className={cn(masterInputCls, 'h-9 pl-9')}
            />
          </div>
        </div>

        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="px-5 py-8">
              <CabinetEmptyState
                icon={Users}
                title={t('clients.noClients')}
                description={t('clients.noClientsDescription')}
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-5 w-[200px]">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-semibold hover:text-foreground transition-colors"
                          onClick={() => handleSort('clientName')}
                        >
                          {t('clients.colClient')}
                          <SortIcon field="clientName" sortBy={sortBy} sortOrder={sortOrder} />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-semibold hover:text-foreground transition-colors"
                          onClick={() => handleSort('totalRequests')}
                        >
                          {t('clients.colRequests')}
                          <SortIcon field="totalRequests" sortBy={sortBy} sortOrder={sortOrder} />
                        </button>
                      </TableHead>
                      <TableHead>{t('clients.colStatuses')}</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-semibold hover:text-foreground transition-colors"
                          onClick={() => handleSort('firstRequestAt')}
                        >
                          {t('clients.colFirstRequest')}
                          <SortIcon field="firstRequestAt" sortBy={sortBy} sortOrder={sortOrder} />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-semibold hover:text-foreground transition-colors"
                          onClick={() => handleSort('lastRequestAt')}
                        >
                          {t('clients.colLastRequest')}
                          <SortIcon field="lastRequestAt" sortBy={sortBy} sortOrder={sortOrder} />
                        </button>
                      </TableHead>
                      <TableHead className="pr-5 text-right">{t('clients.colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <ClientDesktopRow
                        key={client.clientPhone}
                        client={client}
                        formatDate={formatDate}
                        formatRelative={formatRelative}
                        t={t}
                        onViewLeads={() => nav(`${paths.dashboard.leads}?phone=${encodeURIComponent(client.clientPhone)}`)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-white/[0.08]">
                {clients.map((client) => (
                  <ClientMobileCard
                    key={client.clientPhone}
                    client={client}
                    formatDate={formatDate}
                    formatRelative={formatRelative}
                    t={t}
                    expanded={expandedRow === client.clientPhone}
                    onToggle={() =>
                      setExpandedRow((prev) =>
                        prev === client.clientPhone ? null : client.clientPhone
                      )
                    }
                    onViewLeads={() => nav(`${paths.dashboard.leads}?phone=${encodeURIComponent(client.clientPhone)}`)}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  );
}

function ClientDesktopRow({
  client,
  formatDate,
  formatRelative,
  t,
  onViewLeads,
}: {
  client: ClientAggregated;
  formatDate: (s: string) => string;
  formatRelative: (s: string) => string;
  t: (key: string) => string;
  onViewLeads: () => void;
}) {
  return (
    <TableRow className="group">
      <TableCell className="pl-5">
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground truncate max-w-[180px]">
            {client.clientName || t('clients.anonymous')}
          </div>
          <div className={cn('flex items-center gap-1 text-xs', masterTextMuted)}>
            <Phone className="size-3" />
            {client.clientPhone}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusDots breakdown={client.statusBreakdown} total={client.totalRequests} />
      </TableCell>
      <TableCell>
        <StatusBreakdownDetail breakdown={client.statusBreakdown} t={t} />
      </TableCell>
      <TableCell>
        <div className={cn('text-sm', masterTextMuted)}>
          {formatDate(client.firstRequestAt)}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <div className="text-sm font-medium">{formatRelative(client.lastRequestAt)}</div>
          {client.lastMessage && (
            <div className={cn('flex max-w-[180px] items-center gap-1 truncate text-xs', masterTextMuted)}>
              <MessageSquare className="size-3 shrink-0" />
              {client.lastMessage}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="pr-5 text-right">
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 gap-1.5', masterLinkCls, 'hover:bg-[#E97525]/10')}
          onClick={onViewLeads}
        >
          <ExternalLink className="size-3.5" />
          {t('clients.viewLeads')}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ClientMobileCard({
  client,
  formatDate,
  formatRelative,
  t,
  expanded,
  onToggle,
  onViewLeads,
}: {
  client: ClientAggregated;
  formatDate: (s: string) => string;
  formatRelative: (s: string) => string;
  t: (key: string) => string;
  expanded: boolean;
  onToggle: () => void;
  onViewLeads: () => void;
}) {
  return (
    <div className="px-4 py-3">
      <button
        type="button"
        className="w-full text-left"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">
              {client.clientName || t('clients.anonymous')}
            </div>
            <div className={cn('mt-0.5 flex items-center gap-1 text-xs', masterTextMuted)}>
              <Phone className="size-3" />
              {client.clientPhone}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusDots breakdown={client.statusBreakdown} total={client.totalRequests} />
            {expanded ? (
              <ChevronUp className={cn('size-4', masterTextMuted)} />
            ) : (
              <ChevronDown className={cn('size-4', masterTextMuted)} />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
          <StatusBreakdownDetail breakdown={client.statusBreakdown} t={t} />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className={cn('text-xs', masterTextMuted)}>{t('clients.colFirstRequest')}</div>
              <div className="font-medium">{formatDate(client.firstRequestAt)}</div>
            </div>
            <div>
              <div className={cn('text-xs', masterTextMuted)}>{t('clients.colLastRequest')}</div>
              <div className="font-medium">{formatRelative(client.lastRequestAt)}</div>
            </div>
          </div>

          {client.lastMessage && (
            <div className={cn('flex items-start gap-1.5 text-xs', masterTextMuted)}>
              <MessageSquare className="size-3 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{client.lastMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(masterOutlineBtnCls, 'h-9 flex-1 gap-1.5')}
              onClick={onViewLeads}
            >
              <ExternalLink className="size-3.5" />
              {t('clients.viewLeads')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
