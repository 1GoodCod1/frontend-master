import type { NotificationEventType } from '@/constants/notificationEventType';

export type SocketEventType = NotificationEventType;

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
