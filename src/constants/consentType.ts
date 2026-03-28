/**
 * Prisma ConsentType — виды согласий (GDPR / политика / маркетинг и т.д.).
 */
export const CONSENT_TYPE = {
  VERIFICATION_DATA_PROCESSING: 'VERIFICATION_DATA_PROCESSING',
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
  MARKETING: 'MARKETING',
  AGE_CONFIRMATION: 'AGE_CONFIRMATION',
} as const;

export type ConsentType = (typeof CONSENT_TYPE)[keyof typeof CONSENT_TYPE];
