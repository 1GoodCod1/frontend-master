import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { useInView } from '@/hooks/useInView';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  placeholder?: React.ReactNode;
  fallback?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
  skeletonHeight?: number | string;
  skeletonWidth?: number | string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  fallback,
  objectFit = 'cover',
  aspectRatio,
  skeletonHeight,
  skeletonWidth,
  onLoad,
  onError,
  style,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [containerRef, isInView] = useInView('50px', true);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoaded(false);
      setHasError(false);
    });
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    return (
      <Skeleton
        className="absolute left-0 top-0 h-full w-full rounded-none"
        style={{
          width: skeletonWidth ?? '100%',
          height: skeletonHeight ?? '100%',
        }}
      />
    );
  };

  const imageSrc = hasError && fallback ? fallback : src;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: aspectRatio as React.CSSProperties['aspectRatio'], ...style }}
    >
      {!isLoaded && renderPlaceholder()}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          className={cn(
            'absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            props.onClick && 'cursor-pointer',
          )}
          style={{ objectFit }}
          {...Object.fromEntries(
            Object.entries(props).filter(
              ([key]) =>
                ![
                  'ref',
                  'style',
                  'onClick',
                  'objectFit',
                  'aspectRatio',
                  'skeletonHeight',
                  'skeletonWidth',
                  'placeholder',
                  'fallback',
                ].includes(key)
            )
          )}
        />
      )}
    </div>
  );
}
