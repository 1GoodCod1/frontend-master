import type { TabKey } from './types';

export function routeFor(
  type: string,
  role?: string,
  payload?: { conversationId?: string; masterId?: string; data?: { masterId?: string } }
): string {
  if (type === 'new_chat_message' && payload?.conversationId) {
    return role === 'CLIENT'
      ? `/client-dashboard/chat/${payload.conversationId}`
      : `/dashboard/chat/${payload.conversationId}`;
  }
  if (
    type === 'new_lead' ||
    type === 'lead_status_updated' ||
    type === 'lead_sent'
  ) {
    return role === 'ADMIN'
      ? '/admin/leads'
      : role === 'CLIENT'
        ? '/client-dashboard/leads'
        : '/dashboard/leads';
  }
  if (type === 'new_review') {
    return role === 'ADMIN' ? '/admin/reviews' : '/dashboard/reviews';
  }
  if (type === 'subscription_expiring' || type === 'subscription_expired') {
    return role === 'ADMIN' ? '/admin' : '/dashboard/tariff';
  }
  if (type === 'payment_success' || type === 'payment_failed') {
    return role === 'ADMIN' ? '/admin/payments' : '/dashboard/tariff';
  }
  if (type === 'verification_approved' || type === 'verification_rejected') {
    return '/dashboard/verification';
  }
  if (type === 'admin_new_verification') return '/admin/verifications';
  if (type === 'admin_new_report') return '/admin/reports';
  if (type === 'admin_new_lead') return '/admin/leads';
  if (type === 'admin_new_review') return '/admin/reviews';
  if (type === 'admin_new_payment') return '/admin/payments';
  if (type === 'admin_new_user' || type === 'admin_new_master') return '/admin/users';
  if (type === 'booking_pending' || type === 'booking_confirmed' || type === 'booking_cancelled') {
    return role === 'CLIENT' ? '/client-dashboard/leads' : '/dashboard/bookings';
  }
  if (type === 'master_available') {
    const masterId = payload?.data?.masterId ?? payload?.masterId;
    return role === 'CLIENT' && masterId ? `/masters/${masterId}` : '/client-dashboard';
  }
  return role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client-dashboard' : '/dashboard';
}

export function filterByTab(type: string, tab: TabKey): boolean {
  if (tab === 'all') return true;
  if (tab === 'leads')
    return (
      type === 'new_lead' ||
      type === 'lead_status_updated' ||
      type === 'lead_sent' ||
      type === 'new_chat_message' ||
      type === 'admin_new_lead' ||
      type === 'master_responded' ||
      type === 'master_available'
    );
  if (tab === 'reviews')
    return type === 'new_review' || type === 'admin_new_review';
  if (tab === 'payments')
    return (
      type === 'payment_success' ||
      type === 'payment_failed' ||
      type === 'subscription_expiring' ||
      type === 'subscription_expired' ||
      type === 'admin_new_payment'
    );
  if (tab === 'system')
    return (
      type === 'admin_system_alert' ||
      type === 'admin_new_verification' ||
      type === 'admin_new_report' ||
      type === 'admin_new_user' ||
      type === 'admin_new_master' ||
      type === 'verification_approved' ||
      type === 'verification_rejected' ||
      type === 'booking_confirmed' ||
      type === 'booking_cancelled' ||
      type === 'system_maintenance' ||
      type === 'system_update'
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
  if (type === 'master_available') return 'border-l-green-500';
  if (/admin_new_user|admin_new_master/.test(type)) return 'border-l-blue-400';
  if (/booking|system/.test(type)) return 'border-l-purple-500';
  return 'border-l-muted-foreground/50';
}
