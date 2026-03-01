import React from 'react';
import { CheckCircle, XCircle, Monitor, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSecurityLoginHistoryQuery } from '@/features/security/securityApi';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { getBrowserName } from '@/utils/browser';
import { cn } from '@/lib/utils';

interface LoginRecord {
  id: string;
  success: boolean;
  failReason?: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export const LoginHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const { data, isLoading: loading, error: queryError } = useSecurityLoginHistoryQuery();

  const history: LoginRecord[] = Array.isArray(data)
    ? data
    : (data as { data?: LoginRecord[] })?.data ?? [];

  const error = queryError ? t('security.loadHistoryError') : null;

  const formatDate = (dateString: string) => formatDateTimeString(dateString, locale);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('security.loginHistoryEmpty')}</p>
    );
  }

  return (
    <ul className="space-y-2">
      {history.map((record: LoginRecord) => (
        <li
          key={record.id}
          className={cn(
            'rounded-lg border border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.04] p-3',
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {record.success ? (
              <CheckCircle className="size-4 text-green-600 dark:text-green-500" />
            ) : (
              <XCircle className="size-4 text-destructive" />
            )}
            <Badge variant={record.success ? 'default' : 'destructive'} className="text-xs">
              {record.success ? t('security.success') : t('security.failure')}
            </Badge>
            {!record.success && record.failReason && (
              <span className="text-xs text-destructive">({record.failReason})</span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>{formatDate(record.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Monitor className="size-3.5 shrink-0" />
              <span>
                {t('security.ipAddress')}: {record.ipAddress ?? '—'} | {t('security.browser')}:{' '}
                {getBrowserName(record.userAgent ?? null)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
