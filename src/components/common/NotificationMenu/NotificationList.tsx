import { useTranslation } from 'react-i18next';
import type { NotificationItem as NotificationItemType } from '@/features/socket/socketSlice';
import type { NotificationGroupLabel } from './types';
import { NotificationItem } from './NotificationItem';

type Group = { label: string; items: NotificationItemType[] };

type Props = {
  groups: Group[];
  role: string;
  onMarkRead: (id: string) => void;
  onClose: () => void;
};

export function NotificationList({ groups, role, onMarkRead, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <>
      {groups.map((g) => {
        const labelKey = g.label.toLowerCase() as NotificationGroupLabel;
        const translatedLabel = t(`notifications.${labelKey}`) || g.label;
        return (
          <div key={g.label} className="space-y-2">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {translatedLabel}
              </p>
            </div>
            <div className="space-y-2 px-2 pb-1">
              {g.items.map((n) => (
                <NotificationItem
                  key={n.id}
                  item={n}
                  role={role}
                  onMarkRead={onMarkRead}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
