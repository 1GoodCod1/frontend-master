/** CDN base URL из env */
export const CDN_BASE_URL = (import.meta.env.VITE_CDN_BASE_URL as string) || '';

/** Порог свайпа для ImageLightboxModal (px) */
export const IMAGE_LIGHTBOX_SWIPE_THRESHOLD = 50;

/** Порог количества жалоб для показа предупреждения */
export const REPORTS_WARNING_THRESHOLD = 2;

/** Макс. уведомлений в меню */
export const NOTIFICATION_MENU_MAX_VISIBLE = 80;

/** Размер аватара в RecentlyViewed */
export const RECENTLY_VIEWED_AVATAR_SIZE = 36;

/** Акцентный цвет RecentlyViewed — re-export shared accent */
export { ACCENT as RECENTLY_VIEWED_ACCENT } from './theme';
