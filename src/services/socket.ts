import { io, Socket } from 'socket.io-client';
import { env } from '@/services/env';
import type { Store } from '@reduxjs/toolkit';
import { setConnected, pushEvent } from '@/features/socket/socketSlice';
import { selectAccessToken } from '@/features/auth/selectors';
import { api } from '@/services/api';
import { playNotificationSound } from '@/utils/audio';
import type { RootState } from '@/app/store';

let socket: Socket | null = null;

export function getSocket() {
  return socket;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function connectSocket(store: Store<RootState>) {
  // Если socket уже существует и подключен, возвращаем его
  if (socket?.connected) return socket;

  // Если socket существует, но не подключен - отключаем и очищаем listeners
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const token = selectAccessToken(store.getState());
  const wsBase = (env.wsUrl || '').replace(/\/$/, '');
  const notificationsUrl = wsBase ? `${wsBase}/notifications` : '/notifications';
  socket = io(notificationsUrl, {
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
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
  const backendTypeMap: Record<string, MappedType> = {
    // Existing
    NEW_LEAD: 'new_lead',
    NEW_REVIEW: 'new_review',
    LEAD_STATUS_UPDATED: 'lead_status_updated',
    LEAD_SENT: 'lead_sent',
    NEW_CHAT_MESSAGE: 'new_chat_message',
    // Subscription & payments
    SUBSCRIPTION_EXPIRING: 'subscription_expiring',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    // Verification
    VERIFICATION_APPROVED: 'verification_approved',
    VERIFICATION_REJECTED: 'verification_rejected',
    // Admin
    ADMIN_NEW_VERIFICATION: 'admin_new_verification',
    ADMIN_NEW_REPORT: 'admin_new_report',
    ADMIN_NEW_USER: 'admin_new_user',
    ADMIN_NEW_MASTER: 'admin_new_master',
    ADMIN_SYSTEM_ALERT: 'admin_system_alert',
    ADMIN_NEW_LEAD: 'admin_new_lead',
    ADMIN_NEW_REVIEW: 'admin_new_review',
    ADMIN_NEW_PAYMENT: 'admin_new_payment',
    // Client
    MASTER_RESPONDED: 'master_responded',
    MASTER_AVAILABLE: 'master_available',
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_CANCELLED: 'booking_cancelled',
    // System
    SYSTEM_MAINTENANCE: 'system_maintenance',
    SYSTEM_UPDATE: 'system_update',
  };

  const handleNotification = (p: unknown) => {
    const root = isRecord(p) ? p : {};
    const data = isRecord(root.data) ? (root.data as Record<string, unknown>) : {};
    const rawType = root.type ?? data.type;
    // Map backend type or use as-is if already lowercase (from in-app notification service)
    const mapped = rawType
      ? backendTypeMap[String(rawType).toUpperCase()] ?? (rawType as MappedType)
      : undefined;
    if (!mapped) return;
    // Keep full payload when backend sends title/message (in-app and admin notifications)
    const payload =
      root.title != null || root.message != null ? p : (root.data ?? p);
    store.dispatch(pushEvent({ type: mapped, payload }));

    // Cache invalidation by event type. No toasts — all events go to NotificationMenu only.
    if (mapped === 'new_lead' || mapped === 'lead_status_updated' || mapped === 'admin_new_lead') {
      store.dispatch(api.util.invalidateTags(['Leads', 'Analytics']));
    } else if (mapped === 'lead_sent') {
      store.dispatch(api.util.invalidateTags(['Leads']));
    } else if (mapped === 'new_chat_message') {
      store.dispatch(api.util.invalidateTags(['Chat', 'ChatMessages']));
    } else if (mapped === 'new_review' || mapped === 'admin_new_review') {
      store.dispatch(api.util.invalidateTags(['Reviews', 'Analytics']));
    } else if (mapped === 'payment_success' || mapped === 'payment_failed' || mapped === 'admin_new_payment') {
      store.dispatch(api.util.invalidateTags(['Payments']));
    } else if (mapped === 'subscription_expiring' || mapped === 'subscription_expired') {
      store.dispatch(api.util.invalidateTags(['Me', 'Tariffs']));
    } else if (mapped === 'verification_approved' || mapped === 'verification_rejected') {
      store.dispatch(api.util.invalidateTags(['Me', 'Verification']));
    } else if (mapped === 'admin_new_verification') {
      store.dispatch(api.util.invalidateTags(['Verification']));
    } else if (mapped === 'admin_new_report') {
      store.dispatch(api.util.invalidateTags(['Reports']));
    } else if (mapped === 'admin_new_user' || mapped === 'admin_new_master') {
      store.dispatch(api.util.invalidateTags(['Users']));
    }

    // Play sound for all notifications except system maintenance (optional)
    // Check if sound is enabled in store settings
    const state = store.getState();
    const playSoundEnabled = state.socket?.notificationSettings?.playSound ?? true;

    if (playSoundEnabled && mapped !== 'system_maintenance' && mapped !== 'system_update') {
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
