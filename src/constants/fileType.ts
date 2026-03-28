/**
 * Prisma FileType — назначение файла (аватар, фото мастера, прочее).
 */
export const FILE_TYPE = {
  AVATAR: 'AVATAR',
  MASTER_PHOTOS: 'MASTER_PHOTOS',
  OTHER: 'OTHER',
} as const;

export type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];
