import { useState, useMemo } from 'react';
import { isToday, isYesterday } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  clearNotifications,
  markAllRead,
  markRead,
  setNotificationSettings,
} from '@/features/socket/socketSlice';
import type { NotificationItem } from '@/features/socket/socketSlice';
import type { TabKey } from './types';
import { filterByTab } from './utils';

const MAX_VISIBLE = 80;

export function useNotificationMenu() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.socket.notifications);
  const settings = useAppSelector((s) => s.socket.notificationSettings);
  const role = useAppSelector((s) => s.auth.role);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');

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
    return base.slice(0, MAX_VISIBLE);
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

  const handleMarkAllRead = () => dispatch(markAllRead());
  const handleClearAll = () => dispatch(clearNotifications());
  const handleMarkRead = (id: string) => dispatch(markRead(id));
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
