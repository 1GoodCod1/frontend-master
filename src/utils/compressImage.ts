const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
const SKIP_BELOW_BYTES = 300 * 1024;

const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
  if (!needsResize && file.size <= SKIP_BELOW_BYTES) {
    bitmap.close();
    return file;
  }

  let newW = width;
  let newH = height;
  if (needsResize) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    newW = Math.round(width * ratio);
    newH = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, newW, newH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );

  if (!blob || blob.size >= file.size) return file;

  const name = file.name.replace(/\.[^.]+$/, '.jpg');
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
