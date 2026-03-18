const LOCALE_RU = 'ru-RU';
const LOCALE_EN = 'en-GB';
const LOCALE_RO = 'ro-RO';

const LOCALE_MAP: Record<string, string> = {
  en: LOCALE_EN,
  ru: LOCALE_RU,
  ro: LOCALE_RO,
};

/** Resolve BCP 47 locale from i18n language code. */
export function getLocaleFromLanguage(lang: string): string {
  return LOCALE_MAP[lang] ?? lang;
}

/** Format date + time for tables and lists (short date + time). */
export function formatDateTime(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): { dateStr: string; timeStr: string } {
  if (dateInput == null) {
    return { dateStr: '—', timeStr: '—' };
  }
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dateStr = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { dateStr, timeStr };
}

/** Single-line date+time string for dashboard/history. */
export function formatDateTimeString(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): string {
  if (dateInput == null) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Date compact for charts (day + short month, no year). */
export function formatDateCompact(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): string {
  if (dateInput == null) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  });
}

/** Date only (short). */
export function formatDateShort(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): string {
  if (dateInput == null) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format slot start time as HH:MM (for booking slots). */
export function formatSlotTime(slot: { start?: string }): string {
  if (!slot?.start) return '--:--';
  const d = new Date(slot.start);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Time only (HH:MM). */
export function formatTimeOnly(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): string {
  if (dateInput == null) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/** Long date+time (e.g. "15 января 2025, 14:30") for verification and details. */
export function formatDateTimeLong(
  dateInput: string | Date | null | undefined,
  locale: string = LOCALE_RU
): string {
  if (dateInput == null) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
