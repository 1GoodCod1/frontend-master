const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

const CHAT_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const CHAT_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  'pdf',
  'doc',
  'docx',
  'txt',
]);

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — matches server

function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function matchesMimeOrExt(
  file: File,
  mimeSet: Set<string>,
  extSet: Set<string>,
): boolean {
  if (mimeSet.has(file.type)) return true;
  if (file.type) return false;
  return extSet.has(getExtension(file.name));
}

export type FileErrorKey =
  | 'files.invalidType'
  | 'files.tooLarge'
  | 'files.tooMany';

export function isImageFile(file: File): boolean {
  return matchesMimeOrExt(file, IMAGE_MIME_TYPES, IMAGE_EXTENSIONS);
}

export function validateImageFile(file: File): FileErrorKey | null {
  if (!matchesMimeOrExt(file, IMAGE_MIME_TYPES, IMAGE_EXTENSIONS)) {
    return 'files.invalidType';
  }
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}

export function validateChatFile(file: File): FileErrorKey | null {
  if (!matchesMimeOrExt(file, CHAT_MIME_TYPES, CHAT_EXTENSIONS)) {
    return 'files.invalidType';
  }
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}

export interface ValidateFilesResult {
  valid: File[];
  errors: FileErrorKey[];
}

export function validateImageFiles(
  files: File[],
  maxCount?: number,
): ValidateFilesResult {
  const valid: File[] = [];
  const errors: FileErrorKey[] = [];

  for (const file of files) {
    const err = validateImageFile(file);
    if (err) {
      errors.push(err);
    } else {
      valid.push(file);
    }
  }

  if (maxCount != null && valid.length > maxCount) {
    errors.push('files.tooMany');
    valid.length = maxCount;
  }

  return { valid, errors };
}

export function validateChatFiles(
  files: File[],
  maxCount?: number,
): ValidateFilesResult {
  const valid: File[] = [];
  const errors: FileErrorKey[] = [];

  for (const file of files) {
    const err = validateChatFile(file);
    if (err) {
      errors.push(err);
    } else {
      valid.push(file);
    }
  }

  if (maxCount != null && valid.length > maxCount) {
    errors.push('files.tooMany');
    valid.length = maxCount;
  }

  return { valid, errors };
}
