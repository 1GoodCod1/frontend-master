import { type ImgHTMLAttributes } from 'react';

const CDN_BASE = (import.meta.env.VITE_CDN_BASE_URL as string) || '';

export function assetUrl(path: string): string {
  if (!CDN_BASE) return path;
  return `${CDN_BASE.replace(/\/+$/, '')}${path}`;
}

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Path without extension, e.g. "/images/hero-masters" */
  basePath: string;
  /** Fallback format (kept for legacy browsers) */
  fallbackExt?: string;
}

export default function OptimizedImage({
  basePath,
  fallbackExt = 'png',
  alt = '',
  ...rest
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={assetUrl(`${basePath}.webp`)} type="image/webp" />
      <img
        src={assetUrl(`${basePath}.${fallbackExt}`)}
        alt={alt}
        loading="lazy"
        decoding="async"
        {...rest}
      />
    </picture>
  );
}
