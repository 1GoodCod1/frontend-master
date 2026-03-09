import type { NotificationItem } from './socketSlice';
import { safeStorage } from '@/utils/safeStorage';

const KEY_DATA = 'mh_notifications_v1';
const KEY_SETTINGS = 'mh_notif_settings_v1';

export type PersistedNotifications = {
  unreadLeads: number;
  unreadReviews: number;
  notifications: NotificationItem[];
};

export type PersistedNotificationSettings = {
  autoPinLeadStatusUpdates: boolean;
  autoPinReportedReviews: boolean;
  autoPinSpamClosedOnly: boolean;
  playSound: boolean;
};

const DEFAULT_SETTINGS: PersistedNotificationSettings = {
  autoPinLeadStatusUpdates: true,
  autoPinReportedReviews: true,
  autoPinSpamClosedOnly: false,
  playSound: true,
};

export function loadNotifications(): PersistedNotifications | null {
  try {
    const raw = safeStorage.getItem(KEY_DATA);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as PersistedNotifications;
  } catch {
    return null;
  }
}

export function saveNotifications(data: PersistedNotifications) {
  try {
    safeStorage.setItem(KEY_DATA, JSON.stringify(data));
  } catch {
    //
  }
}

export function clearNotificationsStorage() {
  safeStorage.removeItem(KEY_DATA);
}

export function loadNotificationSettings(): PersistedNotificationSettings {
  try {
    const raw = safeStorage.getItem(KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PersistedNotificationSettings>;
    return {
      autoPinLeadStatusUpdates: parsed.autoPinLeadStatusUpdates ?? DEFAULT_SETTINGS.autoPinLeadStatusUpdates,
      autoPinReportedReviews: parsed.autoPinReportedReviews ?? DEFAULT_SETTINGS.autoPinReportedReviews,
      autoPinSpamClosedOnly: parsed.autoPinSpamClosedOnly ?? DEFAULT_SETTINGS.autoPinSpamClosedOnly,
      playSound: parsed.playSound ?? DEFAULT_SETTINGS.playSound,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(s: PersistedNotificationSettings) {
  try {
    safeStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
  } catch {
    //
  }
}
