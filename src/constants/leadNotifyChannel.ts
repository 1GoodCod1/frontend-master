/**
 * Prisma LeadNotifyChannel — куда слать лиды мастеру (Telegram / WhatsApp / оба / нигде).
 */
export const LEAD_NOTIFY_CHANNEL = {
  TELEGRAM: 'TELEGRAM',
  NONE: 'NONE',
} as const;

export type LeadNotifyChannel =
  (typeof LEAD_NOTIFY_CHANNEL)[keyof typeof LEAD_NOTIFY_CHANNEL];

/**
 * Значения для DTO / PATCH (нижний регистр, как class-validator на бэкенде).
 */
export const LEAD_NOTIFY_CHANNEL_INPUT = {
  telegram: 'telegram',
  none: 'none',
} as const;

export type LeadNotifyChannelInput =
  (typeof LEAD_NOTIFY_CHANNEL_INPUT)[keyof typeof LEAD_NOTIFY_CHANNEL_INPUT];
