export const DOCUMENT_TYPE_VALUES = ['PASSPORT', 'ID_CARD', 'DRIVER_LICENSE'] as const;

export type DocumentTypeTranslationKey =
  | 'verification.documentTypes.PASSPORT'
  | 'verification.documentTypes.ID_CARD'
  | 'verification.documentTypes.DRIVER_LICENSE';

export function documentTypeLabelKey(value: string): DocumentTypeTranslationKey | null {
  if (value === 'PASSPORT' || value === 'ID_CARD' || value === 'DRIVER_LICENSE') {
    return `verification.documentTypes.${value}`;
  }
  return null;
}
