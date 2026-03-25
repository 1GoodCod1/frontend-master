import {
  LS_SESSION_ID_KEY,
  LS_SESSION_ID_KEY_LEGACY,
} from '@/constants/storage';
import { safeStorage } from '@/utils/safeStorage';
import { hasSessionConsent } from '@/features/cookie-consent/storage';

/**
 * Возвращает или создаёт session ID для рекомендаций.
 * Для анонимных пользователей — только после получения полного cookie-согласия.
 * Для авторизованных — всегда (согласие дано при регистрации).
 */
export function getSessionId(isAuthenticated = false): string | null {
  if (typeof window === 'undefined') return null;
  if (!isAuthenticated && !hasSessionConsent()) return null;

  let id = safeStorage.getItem(LS_SESSION_ID_KEY);
  if (!id) {
    const legacy = safeStorage.getItem(LS_SESSION_ID_KEY_LEGACY);
    if (legacy) {
      id = legacy;
      safeStorage.setItem(LS_SESSION_ID_KEY, legacy);
      safeStorage.removeItem(LS_SESSION_ID_KEY_LEGACY);
    }
  }
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    safeStorage.setItem(LS_SESSION_ID_KEY, id);
  }
  return id;
}
