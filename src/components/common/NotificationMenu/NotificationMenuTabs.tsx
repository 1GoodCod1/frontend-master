import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { NotificationItem } from '@/features/socket/socketSlice';
import type { TabKey } from './types';
import { NotificationList } from './NotificationList';

const TAB_TRIGGER_CLASS =
  'flex-1 min-w-0 rounded-lg text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold hover:text-foreground text-xs px-2 py-2 transition-colors cursor-pointer';

type UnreadByTab = { leads: number; reviews: number; payments: number; system: number };

type Group = { label: string; items: NotificationItem[] };

type Props = {
  tab: TabKey;
  role: string | null;
  unread: number;
  unreadByTab: UnreadByTab;
  grouped: Group[];
  onTabChange: (tab: TabKey) => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
};

function TabWithBadge({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <span className="flex items-center gap-1.5 px-1">
      {label}
      {count > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/18 text-primary text-[10px] font-semibold px-1 leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}

export function NotificationMenuTabs({
  tab,
  role,
  unread,
  unreadByTab,
  grouped,
  onTabChange,
  onMarkRead,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Tabs
      value={role === 'CLIENT' && tab === 'reviews' ? 'all' : tab}
      onValueChange={(v) => onTabChange(v as TabKey)}
      className="w-full"
    >
      <TabsList className="mx-3 mb-1 h-10 w-[calc(100%-24px)] justify-stretch rounded-xl bg-muted/45 p-1 gap-1">
        <TabsTrigger value="all" className={TAB_TRIGGER_CLASS}>
          <TabWithBadge label={t('notifications.all')} count={unread} />
        </TabsTrigger>
        <TabsTrigger value="leads" className={TAB_TRIGGER_CLASS}>
          <TabWithBadge label={t('notifications.leads')} count={unreadByTab.leads} />
        </TabsTrigger>
        {(role === 'ADMIN' || role === 'MASTER') && (
          <TabsTrigger value="reviews" className={TAB_TRIGGER_CLASS}>
            <TabWithBadge label={t('notifications.reviews')} count={unreadByTab.reviews} />
          </TabsTrigger>
        )}
        {(role === 'ADMIN' || role === 'MASTER') && (
          <TabsTrigger value="payments" className={TAB_TRIGGER_CLASS}>
            <TabWithBadge label={t('notifications.payments')} count={unreadByTab.payments} />
          </TabsTrigger>
        )}
        {role === 'ADMIN' && (
          <TabsTrigger value="system" className={TAB_TRIGGER_CLASS}>
            <TabWithBadge label={t('notifications.system')} count={unreadByTab.system} />
          </TabsTrigger>
        )}
      </TabsList>

      {(['all', 'leads', 'reviews', 'payments', 'system'] as const).map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue} className="mt-0">
          {grouped.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t('notifications.noNotifications')}
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <NotificationList
                groups={grouped}
                role={role ?? ''}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
            </ScrollArea>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
