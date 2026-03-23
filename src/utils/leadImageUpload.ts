/** Allowed MIME types for lead request photo attachments (must match API). */
const LEAD_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const LEAD_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

export function isAllowedLeadImageFile(file: File): boolean {
  if (LEAD_IMAGE_MIME.has(file.type)) return true;
  if (file.type) return false;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return LEAD_IMAGE_EXT.has(ext);
}

export function partitionLeadImageFiles(files: File[]): {
  accepted: File[];
  rejected: number;
} {
  const accepted: File[] = [];
  let rejected = 0;
  for (const f of files) {
    if (isAllowedLeadImageFile(f)) accepted.push(f);
    else rejected += 1;
  }
  return { accepted, rejected };
}
