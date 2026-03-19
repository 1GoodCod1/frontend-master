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
        'flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60',
        item.read && 'opacity-55'
      )}
    >
      <span className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <NotificationIcon type={item.type} />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight text-foreground">
            {t(`notifications.types.${item.type}`, item.title)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {!item.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-0.5 shrink-0" />
            )}
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        {item.message && (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
            {item.message}
          </p>
        )}
      </div>
    </button>
  );
});
