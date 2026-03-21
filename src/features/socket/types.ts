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

export type SocketState = {
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

export const MAX_NOTIFICATIONS = 50;
export const RECENT_TTL_MS = 2 * 60 * 1000;
export const DEDUPE_WINDOW_MS = 60 * 1000;
