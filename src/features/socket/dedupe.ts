import type { SocketEventType } from './types';
import { isRecord } from '@/utils/guards';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';

/** Key for deduplication: same type + same entity = one notification within DEDUPE_WINDOW_MS */
export function dedupeKey(type: SocketEventType, payload: unknown): string | null {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};
  if (type.includes('lead') || type === 'lead_sent' || type === 'lead_status_updated') {
    const leadId = data.leadId ?? p.leadId ?? data.id ?? p.id ?? '';
    return `${type}:${leadId}`;
  }
  if (type.includes('review')) return `${type}:${p.reviewId ?? p.id ?? ''}`;
  if (
    type.includes('payment') ||
    type === NOTIFICATION_EVENT_TYPE.payment_success ||
    type === NOTIFICATION_EVENT_TYPE.payment_failed
  ) {
    return `${type}:${p.paymentId ?? p.id ?? ''}`;
  }
  if (type === NOTIFICATION_EVENT_TYPE.new_chat_message) {
    return `${type}:${p.conversationId ?? ''}:${p.messageId ?? ''}`;
  }
  if (type.includes('verification')) return `${type}:${p.verificationId ?? p.masterId ?? ''}`;
  if (type.includes('report')) return `${type}:${p.reportId ?? ''}`;
  return null;
}

export function stableIdentity(type: SocketEventType, payload: unknown): string | null {
  const p = isRecord(payload) ? payload : {};
  const data = isRecord(p.data) ? (p.data as Record<string, unknown>) : {};

  const eventId = p.notificationId ?? data.notificationId ?? p.eventId ?? data.eventId;
  if (eventId != null) return `${type}:event:${String(eventId)}`;

  const leadId = data.leadId ?? p.leadId ?? data.id ?? p.id;
  if (
    leadId != null &&
    (type.includes('lead') ||
      type === NOTIFICATION_EVENT_TYPE.lead_sent ||
      type === NOTIFICATION_EVENT_TYPE.lead_status_updated)
  ) {
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
  if (
    type === NOTIFICATION_EVENT_TYPE.new_chat_message &&
    (chatConversationId != null || chatMessageId != null)
  ) {
    return `${type}:chat:${String(chatConversationId ?? '')}:${String(chatMessageId ?? '')}`;
  }

  const title = typeof p.title === 'string' ? p.title.trim() : '';
  const message = typeof p.message === 'string' ? p.message.trim() : '';
  if (title || message) return `${type}:text:${title}|${message}`;

  return null;
}
