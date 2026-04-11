import type { TFunction } from 'i18next';

/**
 * Текст toast для ?error=oauth_failed&reason=… * Известный reason — перевод из auth.login.oauthFailHints.*; неизвестный — generic + (code).
 */
export function formatOAuthLoginErrorToast(t: TFunction, reason: string): string {
  const generic = t('auth.login.oauthFailHints.generic');
  const code = reason.trim();
  if (!code) return generic;
  const specific = t(`auth.login.oauthFailHints.${code}`, { defaultValue: '' });
  return specific || `${generic} (${code})`;
}
