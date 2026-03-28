import { USER_ROLE } from '@/constants/roles';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';
import type { TabKey } from './types';

export function routeFor(
  type: string,
  role?: string,
  payload?: { conversationId?: string; masterId?: string; data?: { masterId?: string } }
): string {
  if (type === NOTIFICATION_EVENT_TYPE.new_chat_message && payload?.conversationId) {
    return role === USER_ROLE.CLIENT
      ? `/client-dashboard/chat/${payload.conversationId}`
      : `/dashboard/chat/${payload.conversationId}`;
  }
  if (
    type === NOTIFICATION_EVENT_TYPE.new_lead ||
    type === NOTIFICATION_EVENT_TYPE.lead_status_updated ||
    type === NOTIFICATION_EVENT_TYPE.lead_sent
  ) {
    return role === USER_ROLE.ADMIN
      ? '/admin/leads'
      : role === USER_ROLE.CLIENT
        ? '/client-dashboard/leads'
        : '/dashboard/leads';
  }
  if (type === NOTIFICATION_EVENT_TYPE.new_review) {
    return role === USER_ROLE.ADMIN ? '/admin/reviews' : '/dashboard/reviews';
  }
  if (
    type === NOTIFICATION_EVENT_TYPE.subscription_expiring ||
    type === NOTIFICATION_EVENT_TYPE.subscription_expired
  ) {
    return role === USER_ROLE.ADMIN ? '/admin' : '/dashboard/tariff';
  }
  if (type === NOTIFICATION_EVENT_TYPE.payment_success || type === NOTIFICATION_EVENT_TYPE.payment_failed) {
    return role === USER_ROLE.ADMIN ? '/admin/payments' : '/dashboard/tariff';
  }
  if (
    type === NOTIFICATION_EVENT_TYPE.verification_approved ||
    type === NOTIFICATION_EVENT_TYPE.verification_rejected
  ) {
    return '/dashboard/verification';
  }
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_verification) return '/admin/verifications';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_report) return '/admin/reports';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_lead) return '/admin/leads';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_review) return '/admin/reviews';
  if (type === NOTIFICATION_EVENT_TYPE.admin_new_payment) return '/admin/payments';
  if (
    type === NOTIFICATION_EVENT_TYPE.admin_new_user ||
    type === NOTIFICATION_EVENT_TYPE.admin_new_master
  )
    return '/admin/users';
  if (
    type === NOTIFICATION_EVENT_TYPE.booking_pending ||
    type === NOTIFICATION_EVENT_TYPE.booking_confirmed ||
    type === NOTIFICATION_EVENT_TYPE.booking_cancelled
  ) {
    return role === USER_ROLE.CLIENT
      ? '/client-dashboard/bookings'
      : '/dashboard/bookings';
  }
  if (type === NOTIFICATION_EVENT_TYPE.master_available) {
    const masterId = payload?.data?.masterId ?? payload?.masterId;
    return role === USER_ROLE.CLIENT && masterId
      ? `/masters/${masterId}`
      : '/client-dashboard';
  }
  return role === USER_ROLE.ADMIN
    ? '/admin'
    : role === USER_ROLE.CLIENT
      ? '/client-dashboard'
      : '/dashboard';
}

export function filterByTab(type: string, tab: TabKey): boolean {
  if (tab === 'all') return true;
  if (tab === 'leads')
    return (
      type === NOTIFICATION_EVENT_TYPE.new_lead ||
      type === NOTIFICATION_EVENT_TYPE.lead_status_updated ||
      type === NOTIFICATION_EVENT_TYPE.lead_sent ||
      type === NOTIFICATION_EVENT_TYPE.new_chat_message ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_lead ||
      type === NOTIFICATION_EVENT_TYPE.master_responded ||
      type === NOTIFICATION_EVENT_TYPE.master_available
    );
  if (tab === 'reviews')
    return (
      type === NOTIFICATION_EVENT_TYPE.new_review ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_review
    );
  if (tab === 'payments')
    return (
      type === NOTIFICATION_EVENT_TYPE.payment_success ||
      type === NOTIFICATION_EVENT_TYPE.payment_failed ||
      type === NOTIFICATION_EVENT_TYPE.subscription_expiring ||
      type === NOTIFICATION_EVENT_TYPE.subscription_expired ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_payment
    );
  if (tab === 'system')
    return (
      type === NOTIFICATION_EVENT_TYPE.admin_system_alert ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_verification ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_report ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_user ||
      type === NOTIFICATION_EVENT_TYPE.admin_new_master ||
      type === NOTIFICATION_EVENT_TYPE.verification_approved ||
      type === NOTIFICATION_EVENT_TYPE.verification_rejected ||
      type === NOTIFICATION_EVENT_TYPE.booking_confirmed ||
      type === NOTIFICATION_EVENT_TYPE.booking_cancelled ||
      type === NOTIFICATION_EVENT_TYPE.system_maintenance ||
      type === NOTIFICATION_EVENT_TYPE.system_update
    );
  return true;
}

export function getAccentBorderClass(type: string): string {
  if (/lead|lead_sent|admin_new_lead/.test(type)) return 'border-l-orange-500';
  if (/review|admin_new_review/.test(type)) return 'border-l-yellow-500';
  if (/payment|subscription/.test(type)) return 'border-l-green-500';
  if (/verification_approved|admin_new_verification/.test(type)) return 'border-l-emerald-500';
  if (/verification_rejected|admin_new_report/.test(type)) return 'border-l-destructive';
  if (/chat|master_responded/.test(type)) return 'border-l-blue-500';
  if (type === NOTIFICATION_EVENT_TYPE.master_available) return 'border-l-green-500';
  if (/admin_new_user|admin_new_master/.test(type)) return 'border-l-blue-400';
  if (/booking|system/.test(type)) return 'border-l-purple-500';
  return 'border-l-muted-foreground/50';
}
