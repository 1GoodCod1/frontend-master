import i18n from 'i18next';
import type { SocketEventType } from './types';
import { isRecord } from '@/utils/guards';

export function makeTitle(type: SocketEventType): string {
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

export function shouldAutoPin(
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
    const convId = p.conversationId ?? (isRecord(p.data) ? (p.data as Record<string, unknown>).conversationId : undefined);
    const senderName = p.senderName ?? (isRecord(p.data) ? (p.data as Record<string, unknown>).senderName : undefined);
    if (typeof senderName === 'string' && senderName.trim()) return senderName.trim();
    if (convId) return i18n.t('notifications.messages.openChat');
    return undefined;
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
