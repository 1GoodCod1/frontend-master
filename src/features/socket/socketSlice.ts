import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18n from 'i18next';
import { loadNotifications, loadNotificationSettings, saveNotificationSettings, clearNotificationsStorage } from './persist';
import { clearAuth } from '@/features/auth/authSlice';

export type SocketEventType =
  | 'new_lead'
  | 'new_review'
  | 'lead_status_updated'
  | 'lead_sent'
  | 'new_chat_message'
  // Subscription & payments
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'payment_success'
  | 'payment_failed'
  // Verification
  | 'verification_approved'
  | 'verification_rejected'
  // Admin
  | 'admin_new_verification'
  | 'admin_new_report'
  | 'admin_new_user'
  | 'admin_new_master'
  | 'admin_system_alert'
  | 'admin_new_lead'
  | 'admin_new_review'
  | 'admin_new_payment'
  // Client
  | 'master_responded'
  | 'master_available'
  | 'booking_confirmed'
  | 'booking_cancelled'
  // System
  | 'system_maintenance'
  | 'system_update';

export type SocketEvent = { type: SocketEventType; payload: unknown };

export type NotificationItem = {
  id: string;
  type: SocketEventType;
  title: string;
  message?: string;
  createdAt: number;
  read: boolean;
  pinned: boolean;
  payload: unknown;
};

type SocketState = {
  connected: boolean;
  lastEvent: SocketEvent | null;
  unreadLeads: number;
  unreadReviews: number;
  notificationSettings: {
    autoPinLeadStatusUpdates: boolean;
    autoPinReportedReviews: boolean;
    autoPinSpamClosedOnly: boolean;
    playSound: boolean;
  };
  notifications: NotificationItem[];
  recent: {
    leads: Record<string, number>;
    reviews: Record<string, number>;
  };
};

const MAX_NOTIFICATIONS = 50;
const RECENT_TTL_MS = 2 * 60 * 1000;
const DEDUPE_WINDOW_MS = 60 * 1000;

function now() {
  return Date.now();
}

function makeId() {
  return `${now()}_${Math.random().toString(16).slice(2)}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function pickId(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const v = payload.id ?? payload.leadId ?? payload.reviewId ?? payload.entityId;
  if (v === undefined || v === null) return undefined;
  return String(v);
}

/** Key for deduplication: same type + same entity = one notification within DEDUPE_WINDOW_MS */
function dedupeKey(type: SocketEventType, payload: unknown): string | null {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};
  if (type.includes('lead') || type === 'lead_sent' || type === 'lead_status_updated') {
    const leadId = data.leadId ?? p.leadId ?? data.id ?? p.id ?? '';
    return `${type}:${leadId}`;
  }
  if (type.includes('review')) return `${type}:${p.reviewId ?? p.id ?? ''}`;
  if (type.includes('payment') || type === 'payment_success' || type === 'payment_failed') {
    return `${type}:${p.paymentId ?? p.id ?? ''}`;
  }
  if (type === 'new_chat_message') {
    return `${type}:${p.conversationId ?? ''}:${p.messageId ?? ''}`;
  }
  if (type.includes('verification')) return `${type}:${p.verificationId ?? p.masterId ?? ''}`;
  if (type.includes('report')) return `${type}:${p.reportId ?? ''}`;
  return null;
}

function stableIdentity(type: SocketEventType, payload: unknown): string | null {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};

  const eventId = p.notificationId ?? data.notificationId ?? p.eventId ?? data.eventId;
  if (eventId != null) return `${type}:event:${String(eventId)}`;

  const leadId = data.leadId ?? p.leadId ?? data.id ?? p.id;
  if (leadId != null && (type.includes('lead') || type === 'lead_sent' || type === 'lead_status_updated')) {
    const status = String(data.status ?? p.status ?? data.newStatus ?? p.newStatus ?? '');
    return `${type}:lead:${String(leadId)}:${status}`;
  }

  const reviewId = p.reviewId ?? data.reviewId ?? p.id ?? data.id;
  if (reviewId != null && type.includes('review')) return `${type}:review:${String(reviewId)}`;

  const paymentId = p.paymentId ?? data.paymentId ?? p.id ?? data.id;
  if (paymentId != null && type.includes('payment')) return `${type}:payment:${String(paymentId)}`;

  const verificationId = p.verificationId ?? data.verificationId ?? p.masterId ?? data.masterId;
  if (verificationId != null && type.includes('verification')) return `${type}:verification:${String(verificationId)}`;

  const reportId = p.reportId ?? data.reportId;
  if (reportId != null && type.includes('report')) return `${type}:report:${String(reportId)}`;

  const chatConversationId = p.conversationId ?? data.conversationId;
  const chatMessageId = p.messageId ?? data.messageId;
  if (type === 'new_chat_message' && (chatConversationId != null || chatMessageId != null)) {
    return `${type}:chat:${String(chatConversationId ?? '')}:${String(chatMessageId ?? '')}`;
  }

  const title = typeof p.title === 'string' ? p.title.trim() : '';
  const message = typeof p.message === 'string' ? p.message.trim() : '';
  if (title || message) return `${type}:text:${title}|${message}`;

  return null;
}

function makeTitle(type: SocketEventType): string {
  switch (type) {
    case 'new_lead':
      return 'Новая заявка';
    case 'new_review':
      return 'Новый отзыв';
    case 'lead_status_updated':
      return 'Статус заявки обновлён';
    case 'lead_sent':
      return 'Заявка отправлена';
    case 'new_chat_message':
      return 'Новое сообщение';
    case 'subscription_expiring':
      return 'Подписка истекает';
    case 'subscription_expired':
      return 'Подписка истекла';
    case 'payment_success':
      return 'Оплата успешна';
    case 'payment_failed':
      return 'Ошибка оплаты';
    case 'verification_approved':
      return 'Верификация одобрена';
    case 'verification_rejected':
      return 'Верификация отклонена';
    case 'admin_new_verification':
      return 'Запрос на верификацию';
    case 'admin_new_report':
      return 'Новая жалоба';
    case 'admin_new_user':
      return 'Новый пользователь';
    case 'admin_new_master':
      return 'Новый мастер';
    case 'admin_system_alert':
      return 'Системное уведомление';
    case 'admin_new_lead':
      return 'Новая заявка (админ)';
    case 'admin_new_review':
      return 'Новый отзыв (админ)';
    case 'admin_new_payment':
      return 'Новый платёж';
    case 'master_responded':
      return 'Мастер ответил';
    case 'master_available':
      return 'Мастер доступен';
    case 'booking_confirmed':
      return 'Бронирование подтверждено';
    case 'booking_cancelled':
      return 'Бронирование отменено';
    case 'system_maintenance':
      return 'Техобслуживание';
    case 'system_update':
      return 'Системное обновление';
    default:
      return 'Уведомление';
  }
}

function shouldAutoPin(
  type: SocketEventType,
  payload: unknown,
  settings: { autoPinLeadStatusUpdates: boolean; autoPinReportedReviews: boolean; autoPinSpamClosedOnly: boolean },
): boolean {
  try {
    const p = isRecord(payload) ? payload : {};
    if (type === 'lead_status_updated') {
      if (!settings.autoPinLeadStatusUpdates) return false;
      const lead = isRecord(p.lead) ? (p.lead as Record<string, unknown>) : {};
      const st = String(p.status || p.newStatus || lead.status || '').toUpperCase();
      if (settings.autoPinSpamClosedOnly) {
        return st === 'SPAM' || st === 'CLOSED';
      }
      return true;
    }
    if (type === 'new_review') {
      if (!settings.autoPinReportedReviews) return false;
      const review = isRecord(p.review) ? (p.review as Record<string, unknown>) : {};
      const st = String(p.status || review.status || '').toUpperCase();
      return st === 'REPORTED';
    }
  } catch {
    // ignore parse errors
  }
  return false;
}

function makeMessage(type: SocketEventType, payload: unknown): string | undefined {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};

  // Backend sends messageKey + messageParams for i18n — translate on frontend
  const messageKey = p.messageKey ?? data.messageKey;
  const messageParams = (p.messageParams ?? data.messageParams) as Record<string, string | number> | undefined;
  if (typeof messageKey === 'string' && messageParams) {
    const params = { ...messageParams };
    // Translate lead status (IN_PROGRESS → "В РАБОТЕ" etc.)
    if (messageKey.includes('leadStatusFrom') && params.status) {
      const statusKey = `notifications.status.${String(params.status).toLowerCase()}`;
      params.status = i18n.t(statusKey, { defaultValue: String(params.status) });
    }
    return i18n.t(messageKey, params);
  }

  // Fallback: use message from backend if present
  if (typeof p.message === 'string') {
    return p.message;
  }

  // Build fallback with i18n
  if (type === 'new_lead' || type === 'admin_new_lead') {
    const name = p.name ?? p.clientName ?? data.clientName ?? data.name;
    const phone = p.phone ?? p.clientPhone ?? p.contact ?? data.clientPhone ?? data.phone;
    if (name && phone) return i18n.t('notifications.messages.newLeadFromPhone', { clientName: String(name), phone: String(phone) });
    if (name) return i18n.t('notifications.messages.newLeadFrom', { clientName: String(name) });
    return phone ? String(phone) : undefined;
  }
  if (type === 'new_review' || type === 'admin_new_review') {
    const rating = p.rating;
    const author = p.authorName ?? p.name;
    return [author, rating ? `★ ${rating}` : null].filter(Boolean).join(' · ') || undefined;
  }
  if (type === 'lead_status_updated') {
    const st = p.status ?? p.newStatus ?? data.status;
    const clientName = p.clientName ?? p.name ?? data.clientName ?? data.name;
    if (clientName && st) {
      const statusTranslated = i18n.t(`notifications.status.${String(st).toLowerCase()}`, { defaultValue: String(st) });
      return i18n.t('notifications.messages.leadStatusFrom', { clientName: String(clientName), status: statusTranslated });
    }
    return [clientName ? String(clientName) : null, st].filter(Boolean).join(' · ') || undefined;
  }
  if (type === 'lead_sent') {
    const masterName = p.masterName ?? data.masterName;
    return masterName ? i18n.t('notifications.messages.leadSentTo', { masterName: String(masterName) }) : undefined;
  }
  if (type === 'new_chat_message') {
    return p.conversationId ? i18n.t('notifications.messages.openChat') : undefined;
  }
  if (type === 'subscription_expiring') {
    const days = p.daysLeft ?? data.daysLeft;
    const tariff = p.tariffType ?? data.tariffType;
    if (days && tariff) return i18n.t('notifications.messages.subscriptionExpiring', { tariff: String(tariff), days: Number(days) });
    return undefined;
  }
  if (type === 'subscription_expired') {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.subscriptionExpired', { tariff: String(tariff) }) : undefined;
  }
  if (type === 'payment_success') {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.paymentSuccess', { tariff: String(tariff) }) : i18n.t('notifications.messages.paymentSuccessGeneric');
  }
  if (type === 'payment_failed') {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.paymentFailed', { tariff: String(tariff) }) : undefined;
  }
  if (type === 'verification_approved') return 'Ваш профиль верифицирован ✅';
  if (type === 'verification_rejected') return (typeof p.reason === 'string' ? p.reason : undefined) ?? 'Верификация отклонена';
  if (type === 'admin_new_verification') return (typeof p.masterName === 'string' ? p.masterName : undefined) ?? 'Новый запрос на верификацию';
  if (type === 'admin_new_report') return (typeof p.reason === 'string' ? p.reason : undefined) ?? 'Новая жалоба';
  if (type === 'admin_new_payment') {
    return p.amount ? `${String(p.amount)} MDL` : 'Новый платёж';
  }
  return undefined;
}

function pruneRecent(map: Record<string, number>, t: number) {
  for (const [k, ts] of Object.entries(map)) {
    if (t - ts > RECENT_TTL_MS) delete map[k];
  }
}

const persistedSettings = loadNotificationSettings();
const persistedData = loadNotifications();

function normalizePersistedNotifications(list: unknown): NotificationItem[] {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .filter(Boolean)
    .map((n) => {
      const obj = isRecord(n) ? n : {};
      const type = (obj.type as SocketEventType) ?? 'system_update';
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

      if (evt.type === 'new_lead' || evt.type === 'lead_sent' || evt.type === 'admin_new_lead') {
        state.unreadLeads += 1;
        if (entityId) state.recent.leads[entityId] = t;
      }
      if (evt.type === 'new_chat_message') {
        if (entityId) state.recent.leads[entityId] = t;
      }
      if (evt.type === 'new_review' || evt.type === 'admin_new_review') {
        state.unreadReviews += 1;
        if (entityId) state.recent.reviews[entityId] = t;
      }
      if (evt.type === 'lead_status_updated') {
        if (entityId) state.recent.leads[entityId] = t;
      }

      pruneRecent(state.recent.leads, t);
      pruneRecent(state.recent.reviews, t);

      const item: NotificationItem = {
        id: makeId(),
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
      if (n) n.read = true;
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
  clearLastEvent,
  clearUnreadLeads,
  clearUnreadReviews,
} = slice.actions;

export default slice.reducer;

export const RECENT_TTL = RECENT_TTL_MS;
