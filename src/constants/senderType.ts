/**
 * Prisma SenderType — кто отправил сообщение в чате (клиент или мастер).
 * Не путать с USER_ROLE: семантика «отправитель сообщения».
 */
export const SENDER_TYPE = {
  CLIENT: 'CLIENT',
  MASTER: 'MASTER',
} as const;

export type SenderType = (typeof SENDER_TYPE)[keyof typeof SENDER_TYPE];
