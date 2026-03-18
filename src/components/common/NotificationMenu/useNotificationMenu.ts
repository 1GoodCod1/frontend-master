import { useState, useMemo, useEffect } from 'react';
import { isToday, isYesterday } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  clearNotifications,
  markAllRead,
  markRead,
  setNotificationSettings,
  setNotificationsFromApi,
} from '@/features/socket/socketSlice';
import { isNotificationIdFromBackend } from '@/features/socket/socketSlice';
import type { NotificationItem } from '@/features/socket/socketSlice';
import type { TabKey } from './types';
import { filterByTab } from './utils';
import { NOTIFICATION_MENU_MAX_VISIBLE } from '@/constants';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteAllNotificationsMutation,
} from '@/features/notifications/notificationsApi';

export function useNotificationMenu() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.socket.notifications);
  const settings = useAppSelector((s) => s.socket.notificationSettings);
  const role = useAppSelector((s) => s.auth.role);
  const isAuthed = Boolean(role);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');

  const { data: apiNotifications } = useGetNotificationsQuery(undefined, {
    skip: !isAuthed,
    refetchOnMountOrArgChange: 30,
  });
  const [markAsReadApi] = useMarkNotificationAsReadMutation();
  const [markAllAsReadApi] = useMarkAllNotificationsAsReadMutation();
  const [deleteAllApi] = useDeleteAllNotificationsMutation();

  useEffect(() => {
    if (apiNotifications?.length !== undefined) {
      dispatch(setNotificationsFromApi(apiNotifications));
    }
  }, [apiNotifications, dispatch]);

  const unread = notifications.filter((n) => !n.read).length;

  const unreadByTab = useMemo(
    () => ({
      leads: notifications.filter((n) => !n.read && filterByTab(n.type, 'leads')).length,
      reviews: notifications.filter((n) => !n.read && filterByTab(n.type, 'reviews')).length,
      payments: notifications.filter((n) => !n.read && filterByTab(n.type, 'payments')).length,
      system: notifications.filter((n) => !n.read && filterByTab(n.type, 'system')).length,
    }),
    [notifications],
  );

  const effectiveTab: TabKey =
    role === 'CLIENT' && tab === 'reviews' ? 'all' : tab;

  const filtered = useMemo(() => {
    const base = notifications.filter((n) => filterByTab(n.type, effectiveTab));
    base.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
    return base.slice(0, NOTIFICATION_MENU_MAX_VISIBLE);
  }, [notifications, effectiveTab]);

  const grouped = useMemo(() => {
    const pinned: NotificationItem[] = [];
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const older: NotificationItem[] = [];

    for (const n of filtered) {
      if (n.pinned) {
        pinned.push(n);
        continue;
      }
      const d = new Date(n.createdAt);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else older.push(n);
    }

    const groups: { label: string; items: NotificationItem[] }[] = [];
    if (pinned.length) groups.push({ label: 'Pinned', items: pinned });
    if (today.length) groups.push({ label: 'Today', items: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
    if (older.length) groups.push({ label: 'Older', items: older });
    return groups;
  }, [filtered]);

  const handleClose = () => setOpen(false);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadApi().unwrap();
      dispatch(markAllRead());
    } catch {
      dispatch(markAllRead());
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAllApi().unwrap();
      dispatch(clearNotifications());
    } catch {
      // Don't clear on API failure — data would reappear on F5
    }
  };

  const handleMarkRead = async (id: string) => {
    dispatch(markRead(id));
    if (isNotificationIdFromBackend(id)) {
      markAsReadApi(id).catch(() => {});
    }
  };
  const handleSettings = (patch: Partial<typeof settings>) =>
    dispatch(setNotificationSettings(patch));

  return {
    open,
    setOpen,
    tab,
    setTab,
    effectiveTab,
    role,
    notifications,
    settings,
    unread,
    unreadByTab,
    filtered,
    grouped,
    handleClose,
    handleMarkAllRead,
    handleClearAll,
    handleMarkRead,
    handleSettings,
  };
}
