import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/common/States';
import { formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';

type AuditStreamLog = {
  id?: string;
  action?: string | null;
  entity?: string | null;
  ip?: string | null;
  createdAt?: string | number | null;
} & Record<string, unknown>;

interface StreamTabProps {
  streamLimit: number;
  onStreamLimitChange: (limit: number) => void;
  stream: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    refetch: () => void;
  };
  streamData: AuditStreamLog[];
}

export default function StreamTab({
  streamLimit,
  onStreamLimitChange,
  stream,
  streamData,
}: StreamTabProps) {
  const { i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-2">
          <Label htmlFor="stream-limit">Limit</Label>
          <Input
            id="stream-limit"
            type="number"
            min={10}
            max={500}
            value={streamLimit}
            onChange={(e) => onStreamLimitChange(Number(e.target.value) || 50)}
            className="w-[220px] h-9"
          />
        </div>
        <Badge
          variant="destructive"
          className="font-semibold bg-destructive/15 text-destructive animate-pulse"
        >
          🔴 Live - Updates every 5 seconds
        </Badge>
      </div>

      {stream.isLoading ? (
        <LoadingState />
      ) : stream.isError ? (
        <ErrorState error={stream.error} onRetry={stream.refetch} />
      ) : (
        <div className="p-4 rounded-xl border bg-muted/30 max-h-[600px] overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-4">
            Recent Activity (Last {streamLimit} events)
          </p>
          {streamData.length > 0 ? (
            <div className="space-y-2">
              {streamData.map((log, idx) => (
                <Card
                  key={log.id || idx}
                  className="p-4 rounded-lg border transition-colors hover:bg-primary/5 hover:border-primary/30"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                        <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary">
                          {log.action || 'UNKNOWN'}
                        </Badge>
                        <Badge variant="outline" className="font-medium text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                          {log.entity || 'UNKNOWN'}
                        </Badge>
                        {log.ip && (
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {log.ip}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {log.createdAt ? formatTimeOnly(String(log.createdAt), locale) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </div>
      )}
    </div>
  );
}
