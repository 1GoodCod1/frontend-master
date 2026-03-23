import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem as NotificationItemType } from '@/features/socket/socketSlice';
import { NotificationIcon } from './NotificationIcon';
import { routeFor } from './utils';
import { cn } from '@/lib/utils';
import { isRecord } from '@/utils/guards';

type RoutePayload = { conversationId?: string; masterId?: string; data?: { masterId?: string } };

function getConversationId(p: Record<string, unknown>): string | undefined {
  if (typeof p.conversationId === 'string') return p.conversationId;
  const data = isRecord(p.data) ? p.data : {};
  return typeof data.conversationId === 'string' ? data.conversationId : undefined;
}

type Props = {
  item: NotificationItemType;
  role: string;
  onMarkRead: (id: string) => void;
  onClose: () => void;
};

export const NotificationItem = memo(function NotificationItem({ item, role, onMarkRead, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    const payload: RoutePayload | undefined = (() => {
      const p = item.payload;
      if (!isRecord(p)) return undefined;
      const data = isRecord(p.data) ? p.data : undefined;
      const conversationId = getConversationId(p);
      return {
        conversationId: conversationId || undefined,
        masterId: typeof p.masterId === 'string' ? p.masterId : undefined,
        data:
          data && typeof data.masterId === 'string'
            ? { masterId: data.masterId }
            : undefined,
      };
    })();
    onMarkRead(item.id);
    onClose();
    navigate(routeFor(item.type, role, payload));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none',
        item.read
          ? 'bg-muted/25 hover:bg-muted/40 dark:bg-muted/12 dark:hover:bg-muted/20'
          : 'bg-primary/[0.12] hover:bg-primary/[0.18] dark:bg-primary/[0.16] dark:hover:bg-primary/[0.22]',
      )}
    >
      <span
        className={cn(
          'shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg transition-[filter,opacity]',
          item.read
            ? 'bg-muted/40 opacity-60 grayscale dark:bg-muted/20 dark:opacity-55'
            : 'bg-primary/20 dark:bg-primary/28',
        )}
      >
        <NotificationIcon type={item.type} />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'text-sm leading-tight',
              item.read
                ? 'font-normal text-muted-foreground'
                : 'font-semibold text-foreground',
            )}
          >
            {t(`notifications.types.${item.type}`, item.title)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {!item.read && (
              <span className="h-2 w-2 rounded-full bg-primary mt-0.5 shrink-0" aria-hidden />
            )}
            <span
              className={cn(
                'text-[11px] whitespace-nowrap',
                item.read ? 'text-muted-foreground/50' : 'text-muted-foreground',
              )}
            >
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        {item.message && (
          <p
            className={cn(
              'line-clamp-2 text-xs leading-snug',
              item.read ? 'text-muted-foreground/45' : 'text-muted-foreground',
            )}
          >
            {item.message}
          </p>
        )}
      </div>
    </button>
  );
});
