/**
 * Prisma ReportAction — действия админа по жалобе.
 */
export const REPORT_ACTION = {
  BAN_CLIENT: 'BAN_CLIENT',
  BAN_MASTER: 'BAN_MASTER',
  BAN_IP: 'BAN_IP',
  WARNING_CLIENT: 'WARNING_CLIENT',
  WARNING_MASTER: 'WARNING_MASTER',
  NO_ACTION: 'NO_ACTION',
} as const;

export type ReportAction = (typeof REPORT_ACTION)[keyof typeof REPORT_ACTION];
