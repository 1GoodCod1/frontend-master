import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadNotifications, loadNotificationSettings, saveNotificationSettings, clearNotificationsStorage } from './persist';
import { clearAuth } from '@/features/auth/authSlice';
import { isRecord } from '@/utils/guards';

import type { SocketEvent, NotificationItem, SocketState } from './types';
import { MAX_NOTIFICATIONS, DEDUPE_WINDOW_MS } from './types';
import { now, makeId, isNotificationIdFromBackend, pickId, pruneRecent } from './utils';
import { dedupeKey, stableIdentity } from './dedupe';
import { makeTitle, makeMessage, shouldAutoPin } from './formatters';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';

// Re-export types and utilities so existing imports from socketSlice keep working
export type { SocketEventType, SocketEvent, NotificationItem } from './types';
export { RECENT_TTL_MS as RECENT_TTL } from './types';
export { isNotificationIdFromBackend } from './utils';

function normalizePersistedNotifications(list: unknown): NotificationItem[] {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .filter(Boolean)
    .map((n) => {
      const obj = isRecord(n) ? n : {};
      const type =
        (obj.type as import('./types').SocketEventType) ??
        NOTIFICATION_EVENT_TYPE.system_update;
      return {
        id: String(obj.id ?? makeId()),
        type,
        title: String(obj.title ?? makeTitle(type)),
        message: obj.message ? String(obj.message) : undefined,
        createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : now(),
        read: Boolean(obj.read),
        pinned: Boolean(obj.pinned),
        payload: obj.payload,
      };
    });
}

const persistedSettings = loadNotificationSettings();
const persistedData = loadNotifications();

const initialState: SocketState = {
  connected: false,
  lastEvent: null,
  unreadLeads: persistedData?.unreadLeads ?? 0,
  unreadReviews: persistedData?.unreadReviews ?? 0,
  notificationSettings: persistedSettings,
  notifications: normalizePersistedNotifications(persistedData?.notifications),
  recent: { leads: {}, reviews: {} },
};

const slice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setNotificationSettings(
      state,
      action: PayloadAction<{
        autoPinLeadStatusUpdates?: boolean;
        autoPinReportedReviews?: boolean;
        autoPinSpamClosedOnly?: boolean;
        playSound?: boolean;
      }>,
    ) {
      state.notificationSettings = {
        autoPinLeadStatusUpdates:
          action.payload.autoPinLeadStatusUpdates ?? state.notificationSettings.autoPinLeadStatusUpdates,
        autoPinReportedReviews: action.payload.autoPinReportedReviews ?? state.notificationSettings.autoPinReportedReviews,
        autoPinSpamClosedOnly: action.payload.autoPinSpamClosedOnly ?? state.notificationSettings.autoPinSpamClosedOnly,
        playSound: action.payload.playSound ?? state.notificationSettings.playSound ?? true,
      };
      saveNotificationSettings(state.notificationSettings);
    },

    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },

    pushEvent(state, action: PayloadAction<SocketEvent>) {
      const evt = action.payload;
      state.lastEvent = evt;

      const t = now();
      const key = dedupeKey(evt.type, evt.payload);
      const identity = stableIdentity(evt.type, evt.payload);

      if (identity) {
        const alreadyExists = state.notifications.some(
          (n) => stableIdentity(n.type, n.payload) === identity,
        );
        if (alreadyExists) return;
      }

      if (key) {
        const recent = state.notifications.find((n) => {
          const nkey = dedupeKey(n.type, n.payload);
          return nkey === key && t - n.createdAt < DEDUPE_WINDOW_MS;
        });
        if (recent) return;
      }

      const entityId = pickId(evt.payload);

      if (
        evt.type === NOTIFICATION_EVENT_TYPE.new_lead ||
        evt.type === NOTIFICATION_EVENT_TYPE.lead_sent ||
        evt.type === NOTIFICATION_EVENT_TYPE.admin_new_lead
      ) {
        state.unreadLeads += 1;
        if (entityId) state.recent.leads[entityId] = t;
      }
      // new_chat_message — no unread counter tracking (handled by chatSlice)
      if (
        evt.type === NOTIFICATION_EVENT_TYPE.new_review ||
        evt.type === NOTIFICATION_EVENT_TYPE.admin_new_review
      ) {
        state.unreadReviews += 1;
        if (entityId) state.recent.reviews[entityId] = t;
      }
      if (evt.type === NOTIFICATION_EVENT_TYPE.lead_status_updated) {
        if (entityId) state.recent.leads[entityId] = t;
      }

      pruneRecent(state.recent.leads, t);
      pruneRecent(state.recent.reviews, t);

      const payloadRecord = isRecord(evt.payload) ? evt.payload : {};
      const backendId = payloadRecord.id ?? (isRecord(payloadRecord.data) ? (payloadRecord.data as Record<string, unknown>).id : undefined);
      const itemId = isNotificationIdFromBackend(backendId) ? String(backendId) : makeId();

      const item: NotificationItem = {
        id: itemId,
        type: evt.type,
        title: makeTitle(evt.type),
        message: makeMessage(evt.type, evt.payload),
        createdAt: t,
        read: false,
        pinned: shouldAutoPin(evt.type, evt.payload, state.notificationSettings),
        payload: evt.payload,
      };
      state.notifications.unshift(item);
      if (state.notifications.length > MAX_NOTIFICATIONS) state.notifications.length = MAX_NOTIFICATIONS;
    },

    markAllRead(state) {
      for (const n of state.notifications) n.read = true;
      state.unreadLeads = 0;
      state.unreadReviews = 0;
    },

    markRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      const n = state.notifications.find((x) => x.id === id);
      if (n) {
        const wasUnread = !n.read;
        n.read = true;
        if (wasUnread) {
          if (
            n.type === NOTIFICATION_EVENT_TYPE.new_lead ||
            n.type === NOTIFICATION_EVENT_TYPE.lead_sent ||
            n.type === NOTIFICATION_EVENT_TYPE.admin_new_lead
          ) {
            state.unreadLeads = Math.max(0, state.unreadLeads - 1);
          }
          if (
            n.type === NOTIFICATION_EVENT_TYPE.new_review ||
            n.type === NOTIFICATION_EVENT_TYPE.admin_new_review
          ) {
            state.unreadReviews = Math.max(0, state.unreadReviews - 1);
          }
        }
      }
    },

    togglePin(state, action: PayloadAction<string>) {
      const id = action.payload;
      const n = state.notifications.find((x) => x.id === id);
      if (n) n.pinned = !n.pinned;
    },

    clearNotifications(state) {
      state.notifications = [];
      state.unreadLeads = 0;
      state.unreadReviews = 0;
      clearNotificationsStorage();
    },

    setNotificationsFromApi(state, action: PayloadAction<NotificationItem[]>) {
      const apiItems = action.payload;
      const apiIds = new Set(apiItems.map((n) => n.id));
      const socketOnly = state.notifications.filter((n) => !apiIds.has(n.id));
      const merged = [...apiItems, ...socketOnly].sort((a, b) => b.createdAt - a.createdAt);
      state.notifications = merged.slice(0, MAX_NOTIFICATIONS);
      // Only set counts on first load from API (no prior notifications). Otherwise preserve
      // unreadLeads/unreadReviews — they are cleared by visiting the page and must persist across F5.
      const hadNoNotifications = state.notifications.length === 0;
      if (hadNoNotifications && apiItems.length > 0) {
        state.unreadLeads = merged.filter(
          (n) =>
            !n.read &&
            (n.type === NOTIFICATION_EVENT_TYPE.new_lead ||
              n.type === NOTIFICATION_EVENT_TYPE.lead_sent ||
              n.type === NOTIFICATION_EVENT_TYPE.admin_new_lead),
        ).length;
        state.unreadReviews = merged.filter(
          (n) =>
            !n.read &&
            (n.type === NOTIFICATION_EVENT_TYPE.new_review ||
              n.type === NOTIFICATION_EVENT_TYPE.admin_new_review),
        ).length;
      }
    },

    clearLastEvent(state) {
      state.lastEvent = null;
    },

    clearUnreadLeads(state) {
      state.unreadLeads = 0;
    },

    clearUnreadReviews(state) {
      state.unreadReviews = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearAuth, (state) => {
      state.notifications = [];
      state.unreadLeads = 0;
      state.unreadReviews = 0;
      state.recent = { leads: {}, reviews: {} };
      clearNotificationsStorage();
    });
  },
});

export const {
  setNotificationSettings,
  setConnected,
  pushEvent,
  markAllRead,
  markRead,
  togglePin,
  clearNotifications,
  setNotificationsFromApi,
  clearLastEvent,
  clearUnreadLeads,
  clearUnreadReviews,
} = slice.actions;

export default slice.reducer;
