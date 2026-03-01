import { unstable_usePrompt as usePrompt } from 'react-router-dom';

const DEFAULT_MESSAGE = 'Есть несохранённые изменения. Уйти со страницы?';

/**
 * Блокирует переход по SPA при уходе со страницы, если when === true.
 * Показывает window.confirm с сообщением message.
 * Для перезагрузки/закрытия вкладки используйте beforeunload отдельно при необходимости.
 */
export function useUnsavedChangesPrompt(when: boolean, message: string = DEFAULT_MESSAGE) {
  usePrompt({ when, message });
}

/** Компонент-обёртка для использования внутри формы (например, в Formik children). */
export function UnsavedChangesPrompt({
  when,
  message = DEFAULT_MESSAGE,
}: {
  when: boolean;
  message?: string;
}) {
  useUnsavedChangesPrompt(when, message);
  return null;
}
