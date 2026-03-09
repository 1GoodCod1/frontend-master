const STORAGE_KEY = 'mh_session_id';

/**
 * Возвращает или создаёт постоянный session ID для анонимных пользователей.
 * Нужен для персональных рекомендаций и «Недавно просмотренные» без входа.
 * Безопасно для SSR (вернёт null, если нет window).
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
