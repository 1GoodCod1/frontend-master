/**
 * Переводы разделены на {@link ./core} (первый бандл) и {@link ./extended} (async-чанк).
 * Полный merge не экспортируем — чтобы не тянуть extended в main.
 */
export { buildCoreResources } from './core';
export { buildExtendedResources } from './extended';
