/**
 * Prisma AvailabilityStatus — доступность мастера для ответа / чата.
 */
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  OFFLINE: 'OFFLINE',
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];
