import i18n from 'i18next';
import type { SocketEventType } from './types';
import { isRecord } from '@/utils/guards';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';

export function makeTitle(type: SocketEventType): string {
  switch (type) {
    case NOTIFICATION_EVENT_TYPE.new_lead:
      return 'Новая заявка';
    case NOTIFICATION_EVENT_TYPE.new_review:
      return 'Новый отзыв';
    case NOTIFICATION_EVENT_TYPE.lead_status_updated:
      return 'Статус заявки обновлён';
    case NOTIFICATION_EVENT_TYPE.lead_sent:
      return 'Заявка отправлена';
    case NOTIFICATION_EVENT_TYPE.new_chat_message:
      return 'Новое сообщение';
    case NOTIFICATION_EVENT_TYPE.subscription_expiring:
      return 'Подписка истекает';
    case NOTIFICATION_EVENT_TYPE.subscription_expired:
      return 'Подписка истекла';
    case NOTIFICATION_EVENT_TYPE.payment_success:
      return 'Оплата успешна';
    case NOTIFICATION_EVENT_TYPE.payment_failed:
      return 'Ошибка оплаты';
    case NOTIFICATION_EVENT_TYPE.verification_approved:
      return 'Верификация одобрена';
    case NOTIFICATION_EVENT_TYPE.verification_rejected:
      return 'Верификация отклонена';
    case NOTIFICATION_EVENT_TYPE.admin_new_verification:
      return 'Запрос на верификацию';
    case NOTIFICATION_EVENT_TYPE.admin_new_report:
      return 'Новая жалоба';
    case NOTIFICATION_EVENT_TYPE.admin_new_user:
      return 'Новый пользователь';
    case NOTIFICATION_EVENT_TYPE.admin_new_master:
      return 'Новый мастер';
    case NOTIFICATION_EVENT_TYPE.admin_system_alert:
      return 'Системное уведомление';
    case NOTIFICATION_EVENT_TYPE.admin_new_lead:
      return 'Новая заявка (админ)';
    case NOTIFICATION_EVENT_TYPE.admin_new_review:
      return 'Новый отзыв (админ)';
    case NOTIFICATION_EVENT_TYPE.admin_new_payment:
      return 'Новый платёж';
    case NOTIFICATION_EVENT_TYPE.master_responded:
      return 'Мастер ответил';
    case NOTIFICATION_EVENT_TYPE.master_available:
      return 'Мастер доступен';
    case NOTIFICATION_EVENT_TYPE.booking_pending:
      return 'Новое бронирование';
    case NOTIFICATION_EVENT_TYPE.booking_confirmed:
      return 'Бронирование подтверждено';
    case NOTIFICATION_EVENT_TYPE.booking_cancelled:
      return 'Бронирование отменено';
    case NOTIFICATION_EVENT_TYPE.system_maintenance:
      return 'Техобслуживание';
    case NOTIFICATION_EVENT_TYPE.system_update:
      return 'Системное обновление';
    default:
      return 'Уведомление';
  }
}

export function shouldAutoPin(
  type: SocketEventType,
  payload: unknown,
  settings: { autoPinLeadStatusUpdates: boolean; autoPinReportedReviews: boolean; autoPinSpamClosedOnly: boolean },
): boolean {
  try {
    const p = isRecord(payload) ? payload : {};
    if (type === NOTIFICATION_EVENT_TYPE.lead_status_updated) {
      if (!settings.autoPinLeadStatusUpdates) return false;
      const lead = isRecord(p.lead) ? (p.lead as Record<string, unknown>) : {};
      const st = String(p.status || p.newStatus || lead.status || '').toUpperCase();
      if (settings.autoPinSpamClosedOnly) {
        return st === 'SPAM' || st === 'CLOSED';
      }
      return true;
    }
    if (type === NOTIFICATION_EVENT_TYPE.new_review) {
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

export function makeMessage(type: SocketEventType, payload: unknown): string | undefined {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};

  // Backend sends messageKey + messageParams for i18n — translate on frontend
  const messageKey = p.messageKey ?? data.messageKey;
  const messageParams = (p.messageParams ?? data.messageParams) as Record<string, string | number> | undefined;
  if (typeof messageKey === 'string' && messageParams) {
    const params = { ...messageParams };
    // Translate lead status (IN_PROGRESS → "В РАБОТЕ" etc.)
    if ((messageKey.includes('leadStatusFrom') || messageKey.includes('leadStatusUpdated') || messageKey.includes('reviewStatusUpdated')) && params.status) {
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
  if (type === NOTIFICATION_EVENT_TYPE.new_lead || type === NOTIFICATION_EVENT_TYPE.admin_new_lead) {
    const name = p.name ?? p.clientName ?? data.clientName ?? data.name;
    const phone = p.phone ?? p.clientPhone ?? p.contact ?? data.clientPhone ?? data.phone;
    if (name && phone) return i18n.t('notifications.messages.newLeadFromPhone', { clientName: String(name), phone: String(phone) });
    if (name) return i18n.t('notifications.messages.newLeadFrom', { clientName: String(name) });
    return phone ? String(phone) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.new_review || type === NOTIFICATION_EVENT_TYPE.admin_new_review) {
    const rating = p.rating;
    const author = p.authorName ?? p.name;
    return [author, rating ? `★ ${rating}` : null].filter(Boolean).join(' · ') || undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.lead_status_updated) {
    const st = p.status ?? p.newStatus ?? data.status;
    const clientName = p.clientName ?? p.name ?? data.clientName ?? data.name;
    if (clientName && st) {
      const statusTranslated = i18n.t(`notifications.status.${String(st).toLowerCase()}`, { defaultValue: String(st) });
      return i18n.t('notifications.messages.leadStatusFrom', { clientName: String(clientName), status: statusTranslated });
    }
    return [clientName ? String(clientName) : null, st].filter(Boolean).join(' · ') || undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.lead_sent) {
    const masterName = p.masterName ?? data.masterName;
    return masterName ? i18n.t('notifications.messages.leadSentTo', { masterName: String(masterName) }) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.new_chat_message) {
    const convId = p.conversationId ?? (isRecord(p.data) ? (p.data as Record<string, unknown>).conversationId : undefined);
    const senderName = p.senderName ?? (isRecord(p.data) ? (p.data as Record<string, unknown>).senderName : undefined);
    if (typeof senderName === 'string' && senderName.trim()) return senderName.trim();
    if (convId) return i18n.t('notifications.messages.openChat');
    return undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.subscription_expiring) {
    const days = p.daysLeft ?? data.daysLeft;
    const tariff = p.tariffType ?? data.tariffType;
    if (days && tariff) return i18n.t('notifications.messages.subscriptionExpiring', { tariff: String(tariff), days: Number(days) });
    return undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.subscription_expired) {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.subscriptionExpired', { tariff: String(tariff) }) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.payment_success) {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.paymentSuccess', { tariff: String(tariff) }) : i18n.t('notifications.messages.paymentSuccessGeneric');
  }
  if (type === NOTIFICATION_EVENT_TYPE.payment_failed) {
    const tariff = p.tariffType ?? data.tariffType;
    return tariff ? i18n.t('notifications.messages.paymentFailed', { tariff: String(tariff) }) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.verification_approved) return 'Ваш профиль верифицирован ✅';
  if (type === NOTIFICATION_EVENT_TYPE.verification_rejected)
    return (typeof p.reason === 'string' ? p.reason : undefined) ?? 'Верификация отклонена';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_verification)
    return (typeof p.masterName === 'string' ? p.masterName : undefined) ?? 'Новый запрос на верификацию';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_report)
    return (typeof p.reason === 'string' ? p.reason : undefined) ?? 'Новая жалоба';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_payment) {
    return p.amount ? `${String(p.amount)} MDL` : 'Новый платёж';
  }
  if (type === NOTIFICATION_EVENT_TYPE.booking_confirmed) {
    const masterName = p.masterName ?? data.masterName;
    const startTime = p.startTime ?? data.startTime;
    if (masterName && startTime) {
      const dateStr = new Date(String(startTime)).toLocaleString();
      return `${String(masterName)} — ${dateStr}`;
    }
    return masterName ? String(masterName) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.booking_cancelled) {
    const masterName = p.masterName ?? data.masterName;
    return masterName ? String(masterName) : undefined;
  }
  if (type === NOTIFICATION_EVENT_TYPE.booking_pending) {
    const clientName = p.clientName ?? data.clientName;
    const startTime = p.startTime ?? data.startTime;
    if (clientName && startTime) {
      const dateStr = new Date(String(startTime)).toLocaleString();
      return `${String(clientName)} — ${dateStr}`;
    }
    return clientName ? String(clientName) : undefined;
  }
  return undefined;
}
