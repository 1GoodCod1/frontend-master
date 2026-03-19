import { type ImgHTMLAttributes } from 'react';
import { CDN_BASE_URL } from '@/constants';

function assetUrl(path: string): string {
  if (!CDN_BASE_URL) return path;
  return `${CDN_BASE_URL.replace(/\/+$/, '')}${path}`;
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
  loading = 'lazy',
  decoding = 'async',
  ...rest
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={assetUrl(`${basePath}.webp`)} type="image/webp" />
      <img
        src={assetUrl(`${basePath}.${fallbackExt}`)}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...rest}
      />
    </picture>
  );
}
