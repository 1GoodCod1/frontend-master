/**
 * Тип события уведомления на фронте (после categoryToEventType / socket map).
 * Совпадает с ключами i18n notifications.types.* и с pushEvent в socketSlice.
 */
export const NOTIFICATION_EVENT_TYPE = {
  new_lead: 'new_lead',
  new_review: 'new_review',
  lead_status_updated: 'lead_status_updated',
  lead_sent: 'lead_sent',
  lead_close_requested: 'lead_close_requested',
  new_chat_message: 'new_chat_message',
  subscription_expiring: 'subscription_expiring',
  subscription_expired: 'subscription_expired',
  payment_success: 'payment_success',
  payment_failed: 'payment_failed',
  verification_approved: 'verification_approved',
  verification_rejected: 'verification_rejected',
  admin_new_verification: 'admin_new_verification',
  admin_new_report: 'admin_new_report',
  admin_new_user: 'admin_new_user',
  admin_new_master: 'admin_new_master',
  admin_system_alert: 'admin_system_alert',
  admin_new_lead: 'admin_new_lead',
  admin_new_review: 'admin_new_review',
  admin_new_payment: 'admin_new_payment',
  master_responded: 'master_responded',
  master_available: 'master_available',
  booking_pending: 'booking_pending',
  booking_confirmed: 'booking_confirmed',
  booking_cancelled: 'booking_cancelled',
  system_maintenance: 'system_maintenance',
  system_update: 'system_update',
} as const;

export type NotificationEventType =
  (typeof NOTIFICATION_EVENT_TYPE)[keyof typeof NOTIFICATION_EVENT_TYPE];
