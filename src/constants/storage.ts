/** Сообщение при уходе со страницы с несохранёнными изменениями */
export const UNSAVED_CHANGES_MESSAGE = 'Есть несохранённые изменения. Уйти со страницы?';

/** Ключ localStorage для города пользователя */
export const USER_CITY_STORAGE_KEY = 'userCityName';

/** Ключ reCAPTCHA из env */
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/** Ключ localStorage для истории поиска */
export const SEARCH_HISTORY_STORAGE_KEY = 'mastersSearchHistory';

/** Макс. элементов в истории поиска */
export const SEARCH_HISTORY_MAX_ITEMS = 12;
