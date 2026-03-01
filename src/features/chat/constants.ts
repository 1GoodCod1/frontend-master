/** Chat feature constants — validation, timeouts, limits. */

/** Minimum length for a valid conversation ID (backend format). */
export const MIN_CONVERSATION_ID_LENGTH = 10;

/** Debounce delay (ms) before clearing "typing" indicator after user stops typing. */
export const TYPING_DEBOUNCE_MS = 2000;

/** Time (ms) after which typing user is removed from list if no update. */
export const TYPING_TIMEOUT_MS = 5000;

/** Max files to attach in one message. */
export const MAX_ATTACH_FILES = 10;

/** Default max length for truncated message preview. */
export const MESSAGE_PREVIEW_MAX_LENGTH = 50;
