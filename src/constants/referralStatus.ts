/**
 * Prisma ReferralStatus — стадии реферальной воронки.
 */
export const REFERRAL_STATUS = {
  PENDING: 'PENDING',
  QUALIFIED: 'QUALIFIED',
  REWARDED: 'REWARDED',
  EXPIRED: 'EXPIRED',
} as const;

export type ReferralStatus =
  (typeof REFERRAL_STATUS)[keyof typeof REFERRAL_STATUS];
