import { useTranslation } from 'react-i18next';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  unread: number;
  totalCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
};

export function NotificationMenuHeader({
  unread,
  totalCount,
  onMarkAllRead,
  onClearAll,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          {t('notifications.title')}
        </h3>
        {unread > 0 ? (
          <p className="mt-1 inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary">
            {unread} {t('notifications.unread')}
          </p>
        ) : (
          <p className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t('notifications.allCaughtUp')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 rounded-lg bg-muted/45 p-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-md p-0 text-muted-foreground hover:text-foreground hover:bg-muted/70"
          onClick={onMarkAllRead}
          disabled={totalCount === 0}
          title={t('notifications.markAllRead')}
        >
          <CheckCheck className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-md p-0 text-muted-foreground hover:text-destructive hover:bg-muted/70"
          onClick={onClearAll}
          disabled={totalCount === 0}
          title={t('notifications.clearAll')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
