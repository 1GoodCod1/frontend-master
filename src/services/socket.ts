import type { Socket } from 'socket.io-client';
import { env } from '@/services/env';
import type { Store } from '@reduxjs/toolkit';
import { setConnected, pushEvent } from '@/features/socket/socketSlice';
import { selectAccessToken } from '@/features/auth/selectors';
import { api } from '@/services/api';
import { playNotificationSound } from '@/utils/audio';
import { isRecord } from '@/utils/guards';
import type { RootState } from '@/app/store';
import { NOTIFICATION_CATEGORY_TO_EVENT_TYPE } from '@/constants/notificationCategoryToEventType';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';

let socket: Socket | null = null;

export function getSocket() {
  return socket;
}


export async function connectSocket(store: Store<RootState>) {
  // Если socket уже существует и подключен, возвращаем его
  if (socket?.connected) return socket;

  // Если socket существует, но не подключен - отключаем и очищаем listeners
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // Dynamic import — socket.io-client (~74 KiB) loads only when user authenticates
  const { io } = await import('socket.io-client');

  const wsBase = (env.wsUrl || '').replace(/\/$/, '');
  const notificationsUrl = wsBase ? `${wsBase}/notifications` : '/notifications';
  socket = io(notificationsUrl, {
    transports: ['websocket', 'polling'],
    auth: (cb) => {
      const token = selectAccessToken(store.getState());
      cb(token ? { token } : {});
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    store.dispatch(setConnected(true));
  });
  socket.on('disconnect', () => {
    store.dispatch(setConnected(false));
  });

  type MappedType = import('@/features/socket/socketSlice').SocketEventType;

  const handleNotification = (p: unknown) => {
    const root = isRecord(p) ? p : {};
    const data = isRecord(root.data) ? (root.data as Record<string, unknown>) : {};
    const rawType = root.type ?? data.type;
    // Map backend type or use as-is if already lowercase (from in-app notification service)
    const mapped = rawType
      ? NOTIFICATION_CATEGORY_TO_EVENT_TYPE[String(rawType).toUpperCase()] ??
        (rawType as MappedType)
      : undefined;
    if (!mapped) return;
    // Keep full payload when backend sends title/message (in-app and admin notifications)
    const payload =
      root.title != null || root.message != null ? p : (root.data ?? p);
    store.dispatch(pushEvent({ type: mapped, payload }));

    // Cache invalidation by event type. No toasts — all events go to NotificationMenu only.
    // NOTE: Mutations already invalidate their own tags. Socket events only invalidate
    // tags of OTHER domains that might be affected by the event.
    if (
      mapped === NOTIFICATION_EVENT_TYPE.new_lead ||
      mapped === NOTIFICATION_EVENT_TYPE.admin_new_lead
    ) {
      store.dispatch(
        api.util.invalidateTags(['Leads', 'Analytics']),
      );
    } else if (mapped === NOTIFICATION_EVENT_TYPE.lead_status_updated) {
      // Client needs 'Leads' (their lead list) + 'Reviews' (reviewsCanCreate re-eval after CLOSED).
      // Master's mutation already invalidated their own 'Leads', but the CLIENT needs to know.
      store.dispatch(api.util.invalidateTags(['Leads', 'Bookings', 'Reviews', 'Analytics']));
    } else if (mapped === NOTIFICATION_EVENT_TYPE.lead_sent) {
      store.dispatch(api.util.invalidateTags(['Leads']));
    } else if (mapped === NOTIFICATION_EVENT_TYPE.new_chat_message) {
      store.dispatch(api.util.invalidateTags(['Chat', 'ChatMessages']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.new_review ||
      mapped === NOTIFICATION_EVENT_TYPE.admin_new_review
    ) {
      store.dispatch(api.util.invalidateTags(['Reviews', 'Analytics']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.payment_success ||
      mapped === NOTIFICATION_EVENT_TYPE.payment_failed ||
      mapped === NOTIFICATION_EVENT_TYPE.admin_new_payment
    ) {
      store.dispatch(api.util.invalidateTags(['Payments']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.subscription_expiring ||
      mapped === NOTIFICATION_EVENT_TYPE.subscription_expired
    ) {
      store.dispatch(api.util.invalidateTags(['Me', 'Tariffs']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.verification_approved ||
      mapped === NOTIFICATION_EVENT_TYPE.verification_rejected
    ) {
      store.dispatch(api.util.invalidateTags(['Me', 'Verification']));
    } else if (mapped === NOTIFICATION_EVENT_TYPE.admin_new_verification) {
      store.dispatch(api.util.invalidateTags(['Admin', 'Verification', 'VerificationStats']));
    } else if (mapped === NOTIFICATION_EVENT_TYPE.admin_new_report) {
      store.dispatch(api.util.invalidateTags(['Reports']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.admin_new_user ||
      mapped === NOTIFICATION_EVENT_TYPE.admin_new_master
    ) {
      store.dispatch(api.util.invalidateTags(['Users']));
    } else if (
      mapped === NOTIFICATION_EVENT_TYPE.booking_pending ||
      mapped === NOTIFICATION_EVENT_TYPE.booking_confirmed ||
      mapped === NOTIFICATION_EVENT_TYPE.booking_cancelled
    ) {
      store.dispatch(api.util.invalidateTags(['Bookings']));
    }

    // Play sound for all notifications except system maintenance (optional)
    // Check if sound is enabled in store settings
    const state = store.getState();
    const playSoundEnabled = state.socket?.notificationSettings?.playSound ?? true;

    if (
      playSoundEnabled &&
      mapped !== NOTIFICATION_EVENT_TYPE.system_maintenance &&
      mapped !== NOTIFICATION_EVENT_TYPE.system_update
    ) {
      playNotificationSound();
    }
  };

  // Backend sends 'notification' to masters/clients, 'admin:notification' to admins.
  // Only these two listeners — legacy event names (new_lead, new_review, etc.) are NOT
  // subscribed to avoid duplicate notifications when backend sends both.
  socket.on('notification', handleNotification);
  socket.on('admin:notification', handleNotification);

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  // Удаляем все listeners перед отключением
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
