/** Сообщение при уходе со страницы с несохранёнными изменениями */
export const UNSAVED_CHANGES_MESSAGE = 'Есть несохранённые изменения. Уйти со страницы?';

/**
 * Неочевидные ключи для данных, связанных с сессией (миграция со старых имён в коде).
 * Старые строки оставлены только для однократного переноса и очистки.
 */
export const LS_SESSION_ID_KEY = 'p9k2m7xQv1n4sR';
export const LS_SESSION_ID_KEY_LEGACY = 'mh_session_id';

export const LS_HTTPONLY_SESSION_HINT_KEY = 'w8h3n9pKx2q7vM';
export const LS_HTTPONLY_SESSION_HINT_KEY_LEGACY = 'master-hub.httpOnlySessionHint';

/** Ключ localStorage для города пользователя */
export const USER_CITY_STORAGE_KEY = 'userCityName';

/** Ключ reCAPTCHA из env */
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/** Ключ localStorage для истории поиска */
export const SEARCH_HISTORY_STORAGE_KEY = 'mastersSearchHistory';

/** Макс. элементов в истории поиска */
export const SEARCH_HISTORY_MAX_ITEMS = 12;
