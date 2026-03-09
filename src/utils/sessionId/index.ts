import { safeStorage } from '@/utils/safeStorage';
import { hasFullConsent } from '@/features/cookie-consent/storage';

const STORAGE_KEY = 'mh_session_id';

/**
 * Возвращает или создаёт session ID для рекомендаций.
 * Для анонимных пользователей — только после получения полного cookie-согласия.
 * Для авторизованных — всегда (согласие дано при регистрации).
 */
export function getSessionId(isAuthenticated = false): string | null {
  if (typeof window === 'undefined') return null;
  if (!isAuthenticated && !hasFullConsent()) return null;

  let id = safeStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    safeStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
