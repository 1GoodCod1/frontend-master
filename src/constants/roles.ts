/**
 * Роли пользователей (совпадают с Prisma UserRole на бэкенде).
 * Использовать вместо строковых литералов 'CLIENT' | 'MASTER' | 'ADMIN'.
 */
export const USER_ROLE = {
  CLIENT: 'CLIENT',
  MASTER: 'MASTER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
