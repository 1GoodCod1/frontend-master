import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { saveNotifications } from '@/features/socket/persist';

/**
 * Middleware replacing store.subscribe for notification persistence.
 *
 * store.subscribe fires on EVERY action dispatch (including UI resizes, typing, etc.),
 * causing unnecessary sig computation + localStorage writes.
 *
 * This middleware only runs persistence when a socket-related action actually fires.
 */

const SOCKET_ACTIONS = new Set([
  'socket/pushEvent',
  'socket/markAllRead',
  'socket/markRead',
  'socket/togglePin',
  'socket/clearNotifications',
  'socket/setNotificationsFromApi',
  'socket/clearUnreadLeads',
  'socket/clearUnreadReviews',
]);

interface SocketState {
  socket: {
    unreadLeads: number;
    unreadReviews: number;
    notifications: unknown[];
  };
}

export const notificationPersistMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const result = next(action);

    const act = action as UnknownAction;
    if (typeof act?.type === 'string' && SOCKET_ACTIONS.has(act.type)) {
      const st = store.getState() as SocketState;
      if (st?.socket?.notifications) {
        saveNotifications({
          unreadLeads: st.socket.unreadLeads ?? 0,
          unreadReviews: st.socket.unreadReviews ?? 0,
          notifications: st.socket.notifications as import('@/features/socket/types').NotificationItem[],
        });
      }
    }

    return result;
  };
