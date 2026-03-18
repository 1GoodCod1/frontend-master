import { unstable_usePrompt as usePrompt } from 'react-router-dom';
import { UNSAVED_CHANGES_MESSAGE } from './constants';

/**
 * Блокирует переход по SPA при уходе со страницы, если when === true.
 * Показывает window.confirm с сообщением message.
 * Для перезагрузки/закрытия вкладки используйте beforeunload отдельно при необходимости.
 */
export function useUnsavedChangesPrompt(when: boolean, message: string = UNSAVED_CHANGES_MESSAGE) {
  usePrompt({ when, message });
}

/** Компонент-обёртка для использования внутри формы (например, в Formik children). */
export function UnsavedChangesPrompt({
  when,
  message = UNSAVED_CHANGES_MESSAGE,
}: {
  when: boolean;
  message?: string;
}) {
  useUnsavedChangesPrompt(when, message);
  return null;
}
