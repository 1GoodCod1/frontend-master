export type MasterUserForDisplay = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
} | null | undefined;

export type FormatMasterDisplayNameOptions = {
  /** В модалке «Имя» — только ФИО; email остаётся в своей строке. По умолчанию true (таблица). */
  fallbackToContact?: boolean;
  /** Если нет ФИО (и без fallback). По умолчанию «N/A» для таблицы. */
  emptyLabel?: string;
};

/** Имя мастера: ФИО; при fallbackToContact — email / телефон (удобно в узкой колонке таблицы). */
export function formatMasterDisplayName(
  user: MasterUserForDisplay,
  options?: FormatMasterDisplayNameOptions,
): string {
  const fallbackToContact = options?.fallbackToContact !== false;
  const empty = options?.emptyLabel ?? 'N/A';
  if (!user) return empty;
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (name) return name;
  if (fallbackToContact) {
    if (user.email) return user.email;
    if (user.phone) return user.phone;
  }
  return empty;
}
