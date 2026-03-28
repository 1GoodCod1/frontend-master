import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/common/States';
import { formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import { CONSENT_TYPE } from '@/constants/consentType';
import {
  formatAuditActorLabel,
  auditActorLabelUsesMonoFont,
  type AuditActorUser,
} from '@/utils/auditDisplay';

type AuditStreamLog = {
  id?: string;
  action?: string | null;
  entity?: string | null;
  entityId?: string | null;
  ip?: string | null;
  actorId?: string | null;
  userId?: string | null;
  createdAt?: string | number | null;
  user?: AuditActorUser;
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
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-2">
          <Label htmlFor="stream-limit">{t('admin.audit.limit')}</Label>
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
          🔴 {t('admin.audit.liveUpdates')}
        </Badge>
      </div>

      {stream.isLoading ? (
        <LoadingState />
      ) : stream.isError ? (
        <ErrorState error={stream.error} onRetry={stream.refetch} />
      ) : (
        <div className="p-4 rounded-xl border bg-muted/30 max-h-[600px] overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-4">
            {t('admin.audit.streamRecentActivity', { count: streamLimit })}
          </p>
          {streamData.length > 0 ? (
            <div className="space-y-2">
              {streamData.map((log, idx) => {
                const rawActorId = String(log.actorId ?? log.userId ?? '').trim();
                const displayActor = formatAuditActorLabel(t, log.actorId ?? log.userId, log.user);
                return (
                <Card
                  key={log.id || idx}
                  className="p-4 rounded-lg border transition-colors hover:bg-primary/5 hover:border-primary/30"
                >
                  <CardContent className="p-0 space-y-2">
                    <div className="flex flex-row flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                        <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary">
                          {t(`admin.users.auditAction_${String(log.action)}`, log.action || 'UNKNOWN')}
                        </Badge>
                        <Badge variant="outline" className="font-medium text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                          {log.entity
                            ? t(`admin.audit.entityType_${String(log.entity)}`, String(log.entity))
                            : 'UNKNOWN'}
                        </Badge>
                        {log.action?.startsWith('CONSENT_') &&
                          log.entityId != null &&
                          log.entityId !== '' &&
                          (Object.values(CONSENT_TYPE) as string[]).includes(String(log.entityId)) && (
                          <Badge variant="outline" className="font-medium text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                            {t(
                              `admin.users.consentTypeLabels_${String(log.entityId)}`,
                              String(log.entityId),
                            )}
                          </Badge>
                        )}
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
                    <div className="flex items-start gap-2 min-w-0 min-h-[1.25rem]">
                      <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                      <div className="min-w-0 flex-1 text-xs leading-snug">
                        <span className="text-muted-foreground">{t('admin.audit.actor')}: </span>
                        <span
                          className={
                            auditActorLabelUsesMonoFont(displayActor)
                              ? 'font-mono text-foreground break-all'
                              : 'text-foreground break-words'
                          }
                          title={rawActorId.length > 0 ? rawActorId : undefined}
                        >
                          {displayActor}
                        </span>
                        {log.user?.role && (
                          <span className="text-muted-foreground"> · {log.user.role}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t('admin.audit.noLogsYet')}</p>
          )}
        </div>
      )}
    </div>
  );
}
